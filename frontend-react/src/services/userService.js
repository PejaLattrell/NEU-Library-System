import { db, cloudFunctions } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  runTransaction,
  Timestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { isAdminEmail } from "../config/adminConfig";

const generateEntityQrCallable = httpsCallable(cloudFunctions, "generateEntityQr");
const logAdminActionCallable = httpsCallable(cloudFunctions, "logAdminAction");

const safeGenerateUserQr = async () => {
  try {
    await generateEntityQrCallable({ entityType: "user" });
  } catch (error) {
    console.warn("User QR generation skipped:", error?.message || error);
  }
};

const safeAuditLog = async (payload) => {
  try {
    await logAdminActionCallable(payload);
  } catch (error) {
    console.warn("Audit logging skipped:", error?.message || error);
  }
};

export const createUserIfNotExists = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const shouldBeAdmin = isAdminEmail(user.email);

  if (!userSnap.exists()) {
    const newUserData = {
      name: user.displayName,
      email: user.email,
      role: shouldBeAdmin ? "admin" : "user",
      college: null,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      lastVisit: null,
      totalVisits: 0,
      visits: [],
      notificationPrefs: {
        email: false,
        inApp: true
      }
    };

    await setDoc(userRef, newUserData);
    await safeGenerateUserQr();
    return newUserData;
  }

  const userData = userSnap.data();
  if (shouldBeAdmin && userData.role !== "admin") {
    const updatedData = { ...userData, role: "admin" };
    await updateDoc(userRef, { role: "admin" });
    await safeGenerateUserQr();
    return updatedData;
  }

  if (!userData.qr) {
    await safeGenerateUserQr();
  }

  return userData;
};

export const updateUserProfile = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const recordVisitReason = async (userId, reason) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    const newVisit = {
      reason,
      timestamp: new Date().toISOString()
    };

    const visits = userData.visits || [];
    const updatedVisits = [...visits, newVisit];

    await updateDoc(userRef, {
      lastVisit: new Date().toISOString(),
      lastReason: reason,
      totalVisits: (userData.totalVisits || 0) + 1,
      visits: updatedVisits
    });
  }
};

export const blockUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isBlocked: true,
    blockedAt: new Date().toISOString()
  });

  await safeAuditLog({
    action: "USER_BLOCKED",
    targetType: "user",
    targetId: userId,
    details: {
      isBlocked: true
    }
  });
};

export const unblockUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    isBlocked: false,
    unblockedAt: new Date().toISOString()
  });

  await safeAuditLog({
    action: "USER_UNBLOCKED",
    targetType: "user",
    targetId: userId,
    details: {
      isBlocked: false
    }
  });
};

export const getVisitorStats = async (period = "today", startDateStr = "", endDateStr = "") => {
  const usersRef = collection(db, "users");
  let startDate = new Date();
  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (period === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === "custom") {
    startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
  }

  const q = query(
    usersRef,
    where("role", "==", "user")
  );

  const snapshot = await getDocs(q);
  const allUsers = [];
  let blockedCount = 0;
  let periodVisitorCount = 0;
  const visitReasons = {};
  const collegeBreakdown = {};

  snapshot.forEach((entry) => {
    const userData = entry.data();

    if (userData.isBlocked) {
      blockedCount++;
    }

    allUsers.push({
      id: entry.id,
      ...userData
    });

    const lastVisitDate = userData.lastVisit ? new Date(userData.lastVisit) : null;
    if (lastVisitDate && lastVisitDate >= startDate && lastVisitDate <= endDate) {
      periodVisitorCount++;

      if (userData.lastReason) {
        visitReasons[userData.lastReason] =
          (visitReasons[userData.lastReason] || 0) + 1;
      }

      if (userData.college) {
        collegeBreakdown[userData.college] =
          (collegeBreakdown[userData.college] || 0) + 1;
      }
    }
  });

  allUsers.sort((a, b) => {
    const dateA = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
    const dateB = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
    return dateB - dateA;
  });

  const mostCommonReason = Object.keys(visitReasons).reduce(
    (a, b) => (visitReasons[a] > visitReasons[b] ? a : b),
    "N/A"
  );

  return {
    totalVisitors: periodVisitorCount,
    activeToday: allUsers.filter(
      (v) =>
        v.lastVisit &&
        new Date(v.lastVisit).toDateString() === new Date().toDateString()
    ).length,
    mostCommonReason: mostCommonReason || "N/A",
    mostCommonCount: visitReasons[mostCommonReason] || 0,
    blockedCount,
    collegeBreakdown,
    visitors: allUsers
  };
};

export const searchVisitors = async (searchTerm) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "user"));

  const snapshot = await getDocs(q);
  const results = [];

  snapshot.forEach((entry) => {
    const userData = entry.data();
    const term = searchTerm.toLowerCase();

    if (
      userData.email.toLowerCase().includes(term) ||
      userData.name.toLowerCase().includes(term) ||
      (userData.college && userData.college.toLowerCase().includes(term))
    ) {
      results.push({
        id: entry.id,
        ...userData
      });
    }
  });

  return results;
};

// ==================== BORROWING ====================
const MAX_ACTIVE_BORROWS = 3;

export const getActiveBorrowCount = async (userId) => {
  const checkoutsRef = collection(db, "checkouts");
  const q = query(
    checkoutsRef,
    where("userId", "==", userId),
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const getUserBorrows = async (userId) => {
  const checkoutsRef = collection(db, "checkouts");
  const q = query(
    checkoutsRef,
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB - dateA;
    });
};

export const borrowBook = async (userId, book, borrowData) => {
  const activeCount = await getActiveBorrowCount(userId);
  if (activeCount >= MAX_ACTIVE_BORROWS) {
    throw new Error(`You have already borrowed ${MAX_ACTIVE_BORROWS} books. Please return a book before borrowing another.`);
  }

  const bookRef = doc(db, "books", book.id);

  const dueDate = new Date(borrowData.borrowDate);
  dueDate.setDate(dueDate.getDate() + Number(borrowData.duration));

  const checkoutData = {
    userId,
    bookId: book.id,
    bookTitle: book.title || "Unknown",
    bookAuthor: book.author || "Unknown",
    borrowDate: borrowData.borrowDate,
    borrowTime: borrowData.borrowTime,
    duration: Number(borrowData.duration),
    dueDate: dueDate.toISOString(),
    status: "active",
    createdAt: Timestamp.now(),
    returnedAt: null
  };

  await runTransaction(db, async (transaction) => {
    const bookSnap = await transaction.get(bookRef);
    if (!bookSnap.exists()) {
      throw new Error("Book not found.");
    }

    const bookData = bookSnap.data();
    const available = typeof bookData.available === "number" ? bookData.available : (bookData.quantity || 0);

    if (available <= 0) {
      throw new Error("This book is currently unavailable.");
    }

    transaction.update(bookRef, {
      available: available - 1
    });
  });

  const checkoutsRef = collection(db, "checkouts");
  const docRef = await addDoc(checkoutsRef, checkoutData);

  return { id: docRef.id, ...checkoutData };
};
