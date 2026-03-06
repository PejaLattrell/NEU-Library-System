import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from "firebase/firestore";

// ==================== BOOKS ====================
export const addBook = async (bookData) => {
  try {
    const booksRef = collection(db, "books");
    const docRef = await addDoc(booksRef, {
      ...bookData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      available: bookData.quantity || 1
    });
    return { id: docRef.id, ...bookData };
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
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

export const deleteBook = async (bookId) => {
  try {
    await deleteDoc(doc(db, "books", bookId));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    await deleteDoc(doc(db, "events", eventId));
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    await deleteDoc(doc(db, "announcements", announcementId));
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

export const getAnnouncements = async () => {
  try {
    const announcementsRef = collection(db, "announcements");
    const q = query(
      announcementsRef,
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(announcement => announcement.visible !== false);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};

// ==================== ANALYTICS ====================
export const getAnalyticsData = async (period = "month") => {
  try {
    const visitsRef = collection(db, "users");
    const snapshot = await getDocs(visitsRef);
    
    let totalVisits = 0;
    let visitsByReason = {};
    let visitsByCollege = {};
    let dailyVisits = {};

    const now = new Date();
    let startDate = new Date();

    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setDate(1);
    } else if (period === "year") {
      startDate.setFullYear(now.getFullYear(), 0, 1);
    }

    snapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.visits && Array.isArray(userData.visits)) {
        userData.visits.forEach(visit => {
          const visitDate = new Date(visit.timestamp);
          if (visitDate >= startDate) {
            totalVisits++;
            // By reason
            visitsByReason[visit.reason] = (visitsByReason[visit.reason] || 0) + 1;
            // By college
            visitsByCollege[userData.college] = (visitsByCollege[userData.college] || 0) + 1;
            // Daily
            const dateStr = visitDate.toISOString().split('T')[0];
            dailyVisits[dateStr] = (dailyVisits[dateStr] || 0) + 1;
          }
        });
      }
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
    return { totalVisits: 0, visitsByReason: {}, visitsByCollege: {}, dailyVisits: {} };
  }
};
