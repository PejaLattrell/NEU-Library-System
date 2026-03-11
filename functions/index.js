const {randomUUID} = require("crypto");
const logger = require("firebase-functions/logger");
const {
  onDocumentCreated,
  onDocumentWritten,
} = require("firebase-functions/v2/firestore");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();
let nodemailer = null;

try {
  nodemailer = require("nodemailer");
} catch (error) {
  logger.info("Nodemailer not installed, using SendGrid-only email mode.");
}

const MAX_BATCH_SIZE = 400;

const normalizeDateValue = (raw) => {
  if (!raw) {
    return null;
  }

  if (raw instanceof Date) {
    return raw;
  }

  if (typeof raw.toDate === "function") {
    return raw.toDate();
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const formatHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

const isDateInRange = (date, startDate, endDate) =>
  date && date >= startDate && date <= endDate;

const getClientIp = (rawRequest) => {
  if (!rawRequest || !rawRequest.headers) {
    return "unknown";
  }

  const forwarded = rawRequest.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return rawRequest.ip || "unknown";
};

const getAvailability = (bookData) => {
  if (!bookData) {
    return null;
  }

  if (typeof bookData.available === "number") {
    return bookData.available;
  }

  if (typeof bookData.quantity === "number") {
    return bookData.quantity;
  }

  return null;
};

const listNotificationRecipients = async () => {
  const snapshot = await db.collection("users")
      .where("role", "==", "user")
      .get();

  return snapshot.docs
      .map((doc) => ({id: doc.id, ...doc.data()}))
      .filter((user) => !user.isBlocked);
};

const chunkArray = (items, chunkSize) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
};

const writeInAppNotifications = async (recipients, notification) => {
  if (!recipients.length) {
    return;
  }

  const chunks = chunkArray(recipients, MAX_BATCH_SIZE);
  for (const recipientChunk of chunks) {
    const batch = db.batch();
    recipientChunk.forEach((recipient) => {
      const ref = db.collection("notifications").doc();
      batch.set(ref, {
        userId: recipient.id,
        title: notification.title,
        body: notification.body,
        type: notification.type,
        entityType: notification.entityType || null,
        entityId: notification.entityId || null,
        link: notification.link || null,
        meta: notification.meta || null,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        readAt: null,
      });
    });
    await batch.commit();
  }
};

const sendWithSendGrid = async (emails, payload) => {
  const sendGridKey = process.env.SENDGRID_API_KEY;
  const sendGridFrom = process.env.SENDGRID_FROM_EMAIL;

  if (!sendGridKey || !sendGridFrom || !emails.length) {
    return false;
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${sendGridKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{
        to: emails.map((email) => ({email})),
      }],
      from: {email: sendGridFrom},
      subject: payload.subject,
      content: [
        {type: "text/plain", value: payload.textBody},
        {type: "text/html", value: payload.htmlBody},
      ],
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`SendGrid failed: ${response.status} ${responseText}`);
  }

  return true;
};

const sendWithSmtp = async (emails, payload) => {
  if (!nodemailer || !emails.length) {
    return false;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: smtpFrom,
    bcc: emails,
    subject: payload.subject,
    text: payload.textBody,
    html: payload.htmlBody,
  });

  return true;
};

const sendEmailNotifications = async (recipients, payload) => {
  const emailRecipients = recipients
      .filter((user) => (
        user.notificationPrefs &&
        user.notificationPrefs.email === true
      ))
      .map((user) => user.email)
      .filter(Boolean);
  if (!emailRecipients.length) {
    return;
  }

  try {
    const sentViaSendGrid = await sendWithSendGrid(emailRecipients, payload);
    if (sentViaSendGrid) {
      return;
    }

    const sentViaSmtp = await sendWithSmtp(emailRecipients, payload);
    if (sentViaSmtp) {
      return;
    }

    logger.info(
        "Email channel skipped. Configure SendGrid or SMTP environment vars.",
    );
  } catch (error) {
    logger.error("Email delivery failed", error);
  }
};

const dispatchNotification = async (payload) => {
  const recipients = await listNotificationRecipients();
  await writeInAppNotifications(recipients, payload);

  await sendEmailNotifications(recipients, {
    subject: payload.title,
    textBody: payload.body,
    htmlBody: `<p>${payload.body}</p>`,
  });
};

const assertAdmin = async (uid) => {
  const snapshot = await db.collection("users").doc(uid).get();
  if (!snapshot.exists || snapshot.data().role !== "admin") {
    throw new HttpsError(
        "permission-denied",
        "Only admin users can perform this operation.",
    );
  }
};

const buildDateSeries = (startDate, endDate) => {
  const labels = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    labels.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return labels;
};

exports.onBookAvailabilityChanged = onDocumentWritten(
    "books/{bookId}",
    async (event) => {
      if (!event.data || !event.data.after.exists) {
        return;
      }

      const beforeData = event.data.before.exists ?
        event.data.before.data() : null;
      const afterData = event.data.after.data();

      const beforeAvailability = getAvailability(beforeData);
      const afterAvailability = getAvailability(afterData);

      if (beforeData && beforeAvailability === afterAvailability) {
        return;
      }

      if (afterAvailability === null) {
        return;
      }

      const bookId = event.params.bookId;
      const bookTitle = afterData.title || "Library book";
      const body = afterAvailability > 0 ?
        `${bookTitle} is now available (${afterAvailability} copies).` :
        `${bookTitle} is currently unavailable.`;

      await dispatchNotification({
        title: "Book Availability Update",
        body,
        type: "BOOK_AVAILABILITY",
        entityType: "book",
        entityId: bookId,
        link: "/dashboard#books",
        meta: {
          available: afterAvailability,
          title: bookTitle,
        },
      });
    },
);

exports.onAnnouncementCreated = onDocumentCreated(
    "announcements/{announcementId}",
    async (event) => {
      const data = event.data ? event.data.data() : null;
      if (!data) {
        return;
      }

      const title = data.title || "Library announcement";
      const contentPreview = data.content ?
        data.content.slice(0, 180) : "A new announcement is available.";

      await dispatchNotification({
        title: `New Announcement: ${title}`,
        body: contentPreview,
        type: "ANNOUNCEMENT",
        entityType: "announcement",
        entityId: event.params.announcementId,
        link: "/dashboard",
        meta: {
          priority: data.priority || "normal",
        },
      });
    },
);

exports.onCheckoutCreated = onDocumentCreated(
    "checkouts/{checkoutId}",
    async (event) => {
      const checkoutData = event.data ? event.data.data() : null;
      const bookId = checkoutData ? checkoutData.bookId : null;

      if (!bookId) {
        return;
      }

      const bookRef = db.collection("books").doc(bookId);
      await db.runTransaction(async (transaction) => {
        const bookSnapshot = await transaction.get(bookRef);
        if (!bookSnapshot.exists) {
          return;
        }

        const currentCount = Number(bookSnapshot.data().checkoutCount || 0);
        transaction.update(bookRef, {
          checkoutCount: currentCount + 1,
          lastCheckedOutAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
    },
);

exports.logAdminAction = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  await assertAdmin(request.auth.uid);

  const requestData = request.data || {};
  const action = String(requestData.action || "").trim();
  const targetType = String(requestData.targetType || "").trim();
  const targetId = String(requestData.targetId || "").trim();
  const details = requestData.details || null;

  if (!action || !targetType || !targetId) {
    throw new HttpsError(
        "invalid-argument",
        "action, targetType, and targetId are required.",
    );
  }

  const ipAddress = getClientIp(request.rawRequest);
  const userAgent = request.rawRequest &&
    request.rawRequest.headers &&
    request.rawRequest.headers["user-agent"] || "unknown";

  await db.collection("auditLogs").add({
    action,
    targetType,
    targetId,
    details,
    adminId: request.auth.uid,
    ipAddress,
    userAgent,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {ok: true};
});

exports.generateEntityQr = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const requestData = request.data || {};
  const entityType = String(requestData.entityType || "").toLowerCase();
  if (!["book", "user"].includes(entityType)) {
    throw new HttpsError(
        "invalid-argument",
        "entityType must be either 'book' or 'user'.",
    );
  }

  let entityId = String(requestData.entityId || "").trim();
  if (!entityId && entityType === "user") {
    entityId = request.auth.uid;
  }

  if (!entityId) {
    throw new HttpsError("invalid-argument", "entityId is required.");
  }

  const requestingAdmin = await db.collection("users")
      .doc(request.auth.uid)
      .get();
  const isAdmin = requestingAdmin.exists &&
    requestingAdmin.data().role === "admin";
  const isSelf = entityType === "user" && entityId === request.auth.uid;

  if (!isAdmin && !isSelf) {
    throw new HttpsError(
        "permission-denied",
        "You are not allowed to generate this QR code.",
    );
  }

  const collectionName = entityType === "book" ? "books" : "users";
  const docRef = db.collection(collectionName).doc(entityId);
  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    throw new HttpsError("not-found", "Entity not found.");
  }

  const token = randomUUID();
  const payload = {
    token,
    entityType,
    entityId,
    generatedAt: new Date().toISOString(),
  };

  const qrImageUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=" +
    encodeURIComponent(JSON.stringify(payload));

  await docRef.set({
    qr: {
      token,
      payload,
      qrImageUrl,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      generatedBy: request.auth.uid,
    },
  }, {merge: true});

  return {
    token,
    payload,
    qrImageUrl,
  };
});

exports.getAdvancedAnalytics = onCall(async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }
  await assertAdmin(request.auth.uid);

  const requestData = request.data || {};
  const preset = requestData.preset || "";
  const requestedStartDate = normalizeDateValue(requestData.startDate);
  const requestedEndDate = normalizeDateValue(requestData.endDate);

  let startDate;
  let endDate;

  if (preset && preset !== "custom" && !requestedStartDate) {
    endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    startDate = new Date(endDate);

    switch (preset) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "last7days":
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "last30days":
        startDate.setDate(startDate.getDate() - 29);
        break;
      case "thisWeek": {
        const day = startDate.getDay();
        startDate.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1));
        break;
      }
      case "thisMonth":
        startDate.setDate(1);
        break;
      case "thisYear":
        startDate.setMonth(0, 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 29);
        break;
    }

    startDate.setHours(0, 0, 0, 0);
  } else {
    endDate = requestedEndDate || new Date();
    endDate.setHours(23, 59, 59, 999);

    startDate = requestedStartDate || new Date(endDate);
    if (!requestedStartDate) {
      startDate.setDate(startDate.getDate() - 29);
    }
    startDate.setHours(0, 0, 0, 0);
  }

  if (startDate > endDate) {
    throw new HttpsError(
        "invalid-argument",
        "startDate must be before endDate.",
    );
  }

  const [usersSnap, checkoutsSnap, booksSnap] = await Promise.all([
    db.collection("users").where("role", "==", "user").get(),
    db.collection("checkouts").get(),
    db.collection("books").get(),
  ]);

  const hourlyVisits = Array.from({length: 24}, () => 0);
  const trendsMap = new Map();
  const reasonCounts = {};
  const checkoutCounts = new Map();

  const ensureTrendEntry = (dateKey) => {
    if (!trendsMap.has(dateKey)) {
      trendsMap.set(dateKey, {
        date: dateKey,
        visits: 0,
        checkouts: 0,
      });
    }
    return trendsMap.get(dateKey);
  };

  let totalVisits = 0;

  usersSnap.forEach((userDoc) => {
    const userData = userDoc.data();
    const visits = Array.isArray(userData.visits) ? userData.visits : [];

    visits.forEach((visit) => {
      const visitDate = normalizeDateValue(visit.timestamp);
      if (!isDateInRange(visitDate, startDate, endDate)) {
        return;
      }

      totalVisits += 1;
      hourlyVisits[visitDate.getHours()] += 1;

      const dateKey = toIsoDate(visitDate);
      const dayEntry = ensureTrendEntry(dateKey);
      dayEntry.visits += 1;

      const reason = visit.reason || "Unknown";
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
  });

  let totalCheckouts = 0;

  checkoutsSnap.forEach((checkoutDoc) => {
    const checkout = checkoutDoc.data();
    const checkoutDate = normalizeDateValue(
        checkout.checkedOutAt || checkout.timestamp || checkout.createdAt,
    );

    if (!isDateInRange(checkoutDate, startDate, endDate)) {
      return;
    }

    totalCheckouts += 1;
    const dateKey = toIsoDate(checkoutDate);
    const dayEntry = ensureTrendEntry(dateKey);
    dayEntry.checkouts += 1;

    const bookId = checkout.bookId || "unknown";
    const bookTitle = checkout.bookTitle || checkout.title || "Unknown Book";
    const current = checkoutCounts.get(bookId) || {
      bookId,
      title: bookTitle,
      checkouts: 0,
    };

    current.checkouts += 1;
    checkoutCounts.set(bookId, current);
  });

  let popularBooks = Array.from(checkoutCounts.values())
      .sort((left, right) => right.checkouts - left.checkouts)
      .slice(0, 10);

  if (!popularBooks.length) {
    popularBooks = booksSnap.docs
        .map((doc) => {
          const data = doc.data();
          return {
            bookId: doc.id,
            title: data.title || "Untitled",
            checkouts: Number(data.checkoutCount || 0),
          };
        })
        .filter((book) => book.checkouts > 0)
        .sort((left, right) => right.checkouts - left.checkouts)
        .slice(0, 10);
  }

  const trendLabels = buildDateSeries(startDate, endDate);
  const engagementTrends = trendLabels.map((date) => {
    const values = trendsMap.get(date) || {
      date,
      visits: 0,
      checkouts: 0,
    };

    return {
      ...values,
      engagementScore: values.visits > 0 ?
        Number((values.checkouts / values.visits).toFixed(2)) : 0,
    };
  });

  const peakVisitHours = hourlyVisits.map((visits, hour) => ({
    hour: formatHourLabel(hour),
    visits,
  }));

  const averageDailyVisits = engagementTrends.length > 0 ?
    Number((totalVisits / engagementTrends.length).toFixed(2)) : 0;
  const averageDailyCheckouts = engagementTrends.length > 0 ?
    Number((totalCheckouts / engagementTrends.length).toFixed(2)) : 0;

  const peakHourData = peakVisitHours.reduce(
      (currentMax, item) => item.visits > currentMax.visits ? item : currentMax,
      {hour: "00:00", visits: 0},
  );

  const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({reason, count}))
      .sort((left, right) => right.count - left.count)
      .slice(0, 8);

  return {
    range: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalVisits,
      totalCheckouts,
      averageDailyVisits,
      averageDailyCheckouts,
      peakHour: peakHourData.hour,
      peakHourVisits: peakHourData.visits,
    },
    peakVisitHours,
    popularBooks,
    engagementTrends,
    topReasons,
  };
});


