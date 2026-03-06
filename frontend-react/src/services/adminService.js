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
  orderBy,
  Timestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

const logAdminActionCallable = httpsCallable(cloudFunctions, "logAdminAction");
const generateEntityQrCallable = httpsCallable(cloudFunctions, "generateEntityQr");
const getAdvancedAnalyticsCallable = httpsCallable(
  cloudFunctions,
  "getAdvancedAnalytics"
);

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
export const getAdvancedAnalytics = async ({
  preset = "last30days",
  startDate = "",
  endDate = ""
} = {}) => {
  try {
    const payload = {
      preset,
      startDate: startDate || null,
      endDate: endDate || null
    };

    const response = await getAdvancedAnalyticsCallable(payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching advanced analytics:", error);
    throw error;
  }
};

