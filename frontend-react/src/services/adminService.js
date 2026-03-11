import { db, cloudFunctions } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

const logAdminActionCallable = httpsCallable(cloudFunctions, "logAdminAction");
const generateEntityQrCallable = httpsCallable(cloudFunctions, "generateEntityQr");


const safeAuditLog = async (payload) => {
  try {
    await logAdminActionCallable(payload);
  } catch (error) {
    console.warn("Audit logging skipped:", error?.message || error);
  }
};

const normalizeDateInput = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const dateToYYYYMMDD = (date) => date.toISOString().slice(0, 10);

// ==================== QR ====================
export const generateQrCodeForEntity = async (entityType, entityId = "") => {
  const response = await generateEntityQrCallable({
    entityType,
    entityId
  });

  return response.data;
};

// ==================== BOOKS ====================
export const addBook = async (bookData) => {
  try {
    const booksRef = collection(db, "books");
    const docRef = await addDoc(booksRef, {
      ...bookData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      available: bookData.quantity || 1,
      checkoutCount: 0
    });

    try {
      await generateQrCodeForEntity("book", docRef.id);
    } catch (qrError) {
      console.warn("Book QR generation skipped:", qrError?.message || qrError);
    }

    await safeAuditLog({
      action: "BOOK_CREATED",
      targetType: "book",
      targetId: docRef.id,
      details: {
        title: bookData.title,
        author: bookData.author,
        quantity: Number(bookData.quantity || 0)
      }
    });

    return {
      id: docRef.id,
      ...bookData,
      available: bookData.quantity || 1,
      checkoutCount: 0
    };
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

export const updateBook = async (bookId, bookData) => {
  try {
    const bookRef = doc(db, "books", bookId);
    await updateDoc(bookRef, {
      ...bookData,
      updatedAt: Timestamp.now()
    });

    await safeAuditLog({
      action: "BOOK_UPDATED",
      targetType: "book",
      targetId: bookId,
      details: {
        title: bookData.title,
        quantity: Number(bookData.quantity || 0),
        available: Number(bookData.available || 0)
      }
    });
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

export const deleteBook = async (bookId) => {
  try {
    const bookRef = doc(db, "books", bookId);
    const snapshot = await getDoc(bookRef);

    await deleteDoc(bookRef);

    await safeAuditLog({
      action: "BOOK_DELETED",
      targetType: "book",
      targetId: bookId,
      details: {
        title: snapshot.exists() ? snapshot.data().title : null
      }
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};

export const getBooks = async () => {
  try {
    const booksRef = collection(db, "books");
    const q = query(booksRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

// ==================== EVENTS ====================
export const addEvent = async (eventData) => {
  try {
    const eventsRef = collection(db, "events");
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await safeAuditLog({
      action: "EVENT_CREATED",
      targetType: "event",
      targetId: docRef.id,
      details: {
        title: eventData.title,
        eventDate: eventData.eventDate,
        location: eventData.location || null
      }
    });

    return { id: docRef.id, ...eventData };
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: Timestamp.now()
    });

    await safeAuditLog({
      action: "EVENT_UPDATED",
      targetType: "event",
      targetId: eventId,
      details: {
        title: eventData.title,
        eventDate: eventData.eventDate
      }
    });
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    const snapshot = await getDoc(eventRef);

    await deleteDoc(eventRef);

    await safeAuditLog({
      action: "EVENT_DELETED",
      targetType: "event",
      targetId: eventId,
      details: {
        title: snapshot.exists() ? snapshot.data().title : null
      }
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

export const getEvents = async () => {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("eventDate", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// ==================== ANNOUNCEMENTS ====================
export const createAnnouncement = async (announcementData) => {
  try {
    const announcementsRef = collection(db, "announcements");
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      visible: true
    });

    await safeAuditLog({
      action: "ANNOUNCEMENT_CREATED",
      targetType: "announcement",
      targetId: docRef.id,
      details: {
        title: announcementData.title,
        priority: announcementData.priority || "normal"
      }
    });

    return { id: docRef.id, ...announcementData };
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    const announcementRef = doc(db, "announcements", announcementId);
    await updateDoc(announcementRef, {
      ...announcementData,
      updatedAt: Timestamp.now()
    });

    await safeAuditLog({
      action: "ANNOUNCEMENT_UPDATED",
      targetType: "announcement",
      targetId: announcementId,
      details: {
        title: announcementData.title,
        priority: announcementData.priority || "normal"
      }
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    const announcementRef = doc(db, "announcements", announcementId);
    const snapshot = await getDoc(announcementRef);

    await deleteDoc(announcementRef);

    await safeAuditLog({
      action: "ANNOUNCEMENT_DELETED",
      targetType: "announcement",
      targetId: announcementId,
      details: {
        title: snapshot.exists() ? snapshot.data().title : null
      }
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, "announcements");
    const q = query(announcementsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }))
      .filter((announcement) => announcement.visible !== false);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

// ==================== ANALYTICS (LEGACY/FALLBACK) ====================
export const getAnalyticsData = async (period = "month") => {
  try {
    const visitsRef = collection(db, "users");
    const snapshot = await getDocs(visitsRef);

    let totalVisits = 0;
    const visitsByReason = {};
    const visitsByCollege = {};
    const dailyVisits = {};

    const now = new Date();
    const startDate = new Date();

    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(1);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear(), 0, 1);
    }

    snapshot.forEach((entry) => {
      const userData = entry.data();
      if (!Array.isArray(userData.visits)) {
        return;
      }

      userData.visits.forEach((visit) => {
        const visitDate = normalizeDateInput(visit.timestamp);
        if (!visitDate || visitDate < startDate) {
          return;
        }

        totalVisits += 1;
        visitsByReason[visit.reason] = (visitsByReason[visit.reason] || 0) + 1;
        visitsByCollege[userData.college] =
          (visitsByCollege[userData.college] || 0) + 1;

        const dateStr = dateToYYYYMMDD(visitDate);
        dailyVisits[dateStr] = (dailyVisits[dateStr] || 0) + 1;
      });
    });

    return {
      totalVisits,
      visitsByReason,
      visitsByCollege,
      dailyVisits,
      period
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return {
      totalVisits: 0,
      visitsByReason: {},
      visitsByCollege: {},
      dailyVisits: {}
    };
  }
};

// ==================== ANALYTICS (PRO) ====================

const normalizeDateForAnalytics = (raw) => {
  if (!raw) return null;
  if (typeof raw.toDate === "function") return raw.toDate();
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (date) => date.toISOString().slice(0, 10);
const formatHourLabel = (hour) => `${String(hour).padStart(2, "0")}:00`;

const buildDateSeries = (start, end) => {
  const labels = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    labels.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return labels;
};

export const getAdvancedAnalytics = async ({
  preset = "last30days",
  startDate: startDateArg = "",
  endDate: endDateArg = ""
} = {}) => {
  try {
    let startDate;
    let endDate;

    if (preset && preset !== "custom" && !startDateArg) {
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
      endDate = startDateArg ? new Date(endDateArg || Date.now()) : new Date();
      endDate.setHours(23, 59, 59, 999);
      startDate = startDateArg ? new Date(startDateArg) : new Date(endDate);
      if (!startDateArg) {
        startDate.setDate(startDate.getDate() - 29);
      }
      startDate.setHours(0, 0, 0, 0);
    }

    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("role", "==", "user"));
    const checkoutsRef = collection(db, "checkouts");
    const booksRef = collection(db, "books");

    const [usersSnap, checkoutsSnap, booksSnap] = await Promise.all([
      getDocs(usersQuery),
      getDocs(checkoutsRef),
      getDocs(booksRef)
    ]);

    const hourlyVisits = Array.from({ length: 24 }, () => 0);
    const trendsMap = new Map();
    const reasonCounts = {};
    const checkoutCounts = new Map();

    const ensureTrendEntry = (dateKey) => {
      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, { date: dateKey, visits: 0, checkouts: 0 });
      }
      return trendsMap.get(dateKey);
    };

    let totalVisits = 0;

    usersSnap.forEach((userDoc) => {
      const userData = userDoc.data();
      const visits = Array.isArray(userData.visits) ? userData.visits : [];

      visits.forEach((visit) => {
        const visitDate = normalizeDateForAnalytics(visit.timestamp);
        if (!visitDate || visitDate < startDate || visitDate > endDate) return;

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
      const checkoutDate = normalizeDateForAnalytics(
        checkout.checkedOutAt || checkout.timestamp || checkout.createdAt
      );

      if (!checkoutDate || checkoutDate < startDate || checkoutDate > endDate) return;

      totalCheckouts += 1;
      const dateKey = toIsoDate(checkoutDate);
      const dayEntry = ensureTrendEntry(dateKey);
      dayEntry.checkouts += 1;

      const bookId = checkout.bookId || "unknown";
      const bookTitle = checkout.bookTitle || checkout.title || "Unknown Book";
      const current = checkoutCounts.get(bookId) || { bookId, title: bookTitle, checkouts: 0 };
      current.checkouts += 1;
      checkoutCounts.set(bookId, current);
    });

    let popularBooks = Array.from(checkoutCounts.values())
      .sort((a, b) => b.checkouts - a.checkouts)
      .slice(0, 10);

    if (!popularBooks.length) {
      popularBooks = booksSnap.docs
        .map((d) => {
          const data = d.data();
          return {
            bookId: d.id,
            title: data.title || "Untitled",
            checkouts: Number(data.checkoutCount || 0)
          };
        })
        .filter((b) => b.checkouts > 0)
        .sort((a, b) => b.checkouts - a.checkouts)
        .slice(0, 10);
    }

    const trendLabels = buildDateSeries(startDate, endDate);
    const engagementTrends = trendLabels.map((date) => {
      const values = trendsMap.get(date) || { date, visits: 0, checkouts: 0 };
      return {
        ...values,
        engagementScore: values.visits > 0
          ? Number((values.checkouts / values.visits).toFixed(2))
          : 0
      };
    });

    const peakVisitHours = hourlyVisits.map((visits, hour) => ({
      hour: formatHourLabel(hour),
      visits
    }));

    const averageDailyVisits = engagementTrends.length > 0
      ? Number((totalVisits / engagementTrends.length).toFixed(2))
      : 0;
    const averageDailyCheckouts = engagementTrends.length > 0
      ? Number((totalCheckouts / engagementTrends.length).toFixed(2))
      : 0;

    const peakHourData = peakVisitHours.reduce(
      (max, item) => (item.visits > max.visits ? item : max),
      { hour: "00:00", visits: 0 }
    );

    const topReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      range: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      summary: {
        totalVisits,
        totalCheckouts,
        averageDailyVisits,
        averageDailyCheckouts,
        peakHour: peakHourData.hour,
        peakHourVisits: peakHourData.visits
      },
      peakVisitHours,
      popularBooks,
      engagementTrends,
      topReasons
    };
  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    throw error;
  }
};


// ==================== BORROWING / RETURNS ====================
export const returnBook = async (checkoutId, bookId) => {
  try {
    const checkoutRef = doc(db, "checkouts", checkoutId);
    await updateDoc(checkoutRef, {
      status: "returned",
      returnedAt: Timestamp.now()
    });

    const bookRef = doc(db, "books", bookId);
    const bookSnap = await getDoc(bookRef);
    if (bookSnap.exists()) {
      const bookData = bookSnap.data();
      const currentAvailable = typeof bookData.available === "number" ? bookData.available : 0;
      await updateDoc(bookRef, {
        available: currentAvailable + 1
      });
    }

    await safeAuditLog({
      action: "BOOK_RETURNED",
      targetType: "checkout",
      targetId: checkoutId,
      details: { bookId }
    });
  } catch (error) {
    console.error("Error returning book:", error);
    throw error;
  }
};

export const getOverdueCheckouts = async () => {
  try {
    const checkoutsRef = collection(db, "checkouts");
    const q = query(checkoutsRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);

    const now = new Date();
    const overdueList = [];

    for (const entry of snapshot.docs) {
      const data = entry.data();
      const dueDate = data.dueDate ? new Date(data.dueDate) : null;

      if (dueDate && dueDate < now) {
        let userName = "Unknown";
        let userEmail = "";

        try {
          const userRef = doc(db, "users", data.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            userName = userData.name || "Unknown";
            userEmail = userData.email || "";
          }
        } catch (err) {
          console.warn("Could not fetch user for overdue checkout:", err);
        }

        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));

        overdueList.push({
          id: entry.id,
          ...data,
          userName,
          userEmail,
          daysOverdue
        });
      }
    }

    overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue);
    return overdueList;
  } catch (error) {
    console.error("Error fetching overdue checkouts:", error);
    return [];
  }
};
