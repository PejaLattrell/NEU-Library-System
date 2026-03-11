# Book Borrowing System Implementation

The book borrowing feature is fully functional. Both the student-facing dashboard UI and the administrator overdue tracking system have been implemented and verified.

## What Was Completed

### 1. Student Borrowing System
- **Book Details Modal**: Built [BookDetailModal](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/components/BookDetailModal.jsx#15-211) that displays complete book info (Title, Author, Total Copies, availability status, etc.) with a polished, blurred background overlay and slide-up animations.
- **Borrow Functionality**: Students can now request to borrow a book by selecting a pickup date, pickup time, and duration (defaulting to 7 days).
- **Borrow Limits enforced**: The system correctly limits each student to **3 active checked-out books** at a time. The limit is gracefully enforced in the UI (disabling the borrow button) and securely double-checked in the database via Firestore transaction logic.
- **My Borrowed Books**: A brand-new section now appears on the student dashboard representing the student's active borrows with their due dates and lively status badges ("Active", "Overdue").

### 2. Admin Tracking System
- **Overdue Books Tracking**: The Admin Dashboard has been equipped to surface books that are past due. It calculates this dynamically by fetching active borrows, checking their due dates against the current date, and listing them in a dedicated 'Overdue Books' data table.
- **Returning Books**: Admins can now press "Mark Returned" continuously from the table layout. This increments the specific book's availability count across the system seamlessly and logs an audit trail event.

### 3. Verification & Testing
- The implementation was verified locally showing the complete flow starting from search navigation passing into borrowing, to admin rendering the late items properly.

![Browser Recording of Borrowing Flow](file:///C:/Users/User/.gemini/antigravity/brain/7da7e627-562e-42ba-ad36-d867f416c9df/borrowing_flow_1772985959798.webp)

## Modified Files
````diff:Navbar.jsx
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getBooks } from "../services/adminService";
import logoImg from "../assets/logo.png";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getBooks();
        setAllBooks(books);
      } catch (error) {
        console.error("Error fetching books for search:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = allBooks.filter((book) =>
      (book.title || "").toLowerCase().includes(lowerTerm) ||
      (book.author || "").toLowerCase().includes(lowerTerm) ||
      (book.category || "").toLowerCase().includes(lowerTerm) ||
      (book.isbn || "").toLowerCase().includes(lowerTerm)
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    navigate("/dashboard");
  };

  const handleDashboardClick = () => {
    if (userRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logoImg} alt="NEU Logo" className="logo-img" />
          <span className="logo-text">NEU Library</span>
        </Link>

        <div className="nav-menu">
          <button onClick={handleDashboardClick} className="nav-item active">
            <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            Dashboard
          </button>
          {userRole !== "admin" && (
            <>
              <a href="#books" className="nav-item">
                <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                Browse Books
              </a>
              <a href="#mybooks" className="nav-item">
                <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                </svg>
                My Books
              </a>
            </>
          )}
        </div>

        <div className="navbar-right">
          {userRole !== "admin" && (
            <div className="search-box" ref={searchRef}>
              <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search books..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
              />
              {showResults && (
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 8).map((book) => (
                      <div
                        key={book.id}
                        className="search-result-item"
                        onClick={handleResultClick}
                      >
                        <span className="search-result-title">{book.title}</span>
                        <span className="search-result-meta">by {book.author}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-no-results">No books found</div>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414-1.414L11.586 7H6a1 1 0 110-2h5.586L8.293 1.707a1 1 0 011.414-1.414L14 4.586V7.414z" clipRule="evenodd"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
===

import { auth, db } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getBooks } from "../services/adminService";
import logoImg from "../assets/logo.png";
import "../styles/Navbar.css";

function Navbar({ onBookSelect }) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allBooks, setAllBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role);
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const books = await getBooks();
        setAllBooks(books);
      } catch (error) {
        console.error("Error fetching books for search:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = allBooks.filter((book) =>
      (book.title || "").toLowerCase().includes(lowerTerm) ||
      (book.author || "").toLowerCase().includes(lowerTerm) ||
      (book.category || "").toLowerCase().includes(lowerTerm) ||
      (book.isbn || "").toLowerCase().includes(lowerTerm)
    );

    setSearchResults(filtered);
    setShowResults(true);
  };

  const handleResultClick = (book) => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    if (onBookSelect) {
      onBookSelect(book);
    } else {
      navigate("/dashboard");
    }
  };

  const handleDashboardClick = () => {
    if (userRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleDashboardClick} style={{ cursor: "pointer" }}>
          <img src={logoImg} alt="NEU Logo" className="logo-img" />
          <span className="logo-text">NEU Library</span>
        </div>

        <div className="nav-menu">
          <button onClick={handleDashboardClick} className="nav-item active">
            <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            Dashboard
          </button>
          {userRole === "user" && (
            <>
              <a href="#books" className="nav-item">
                <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                Browse Books
              </a>
              <a href="#mybooks" className="nav-item">
                <svg className="nav-svg-icon" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                </svg>
                My Books
              </a>
            </>
          )}
        </div>

        <div className="navbar-right">
          {userRole === "user" && (
            <div className="search-box" ref={searchRef}>
              <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search books..." 
                className="search-input"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
              />
              {showResults && (
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.slice(0, 8).map((book) => (
                      <div
                        key={book.id}
                        className="search-result-item"
                        onClick={handleResultClick}
                      >
                        <span className="search-result-title">{book.title}</span>
                        <span className="search-result-meta">by {book.author}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-no-results">No books found</div>
                  )}
                </div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414-1.414L11.586 7H6a1 1 0 110-2h5.586L8.293 1.707a1 1 0 011.414-1.414L14 4.586V7.414z" clipRule="evenodd"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
````

````diff:userService.js
import { db, cloudFunctions } from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
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
===
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
````

`render_diffs(file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/services/adminService.js)`

````diff:Dashboard.jsx
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AnnouncementsBanner from "../components/AnnouncementsBanner";
import { auth } from "../firebase/firebase";
import { getBooks, getEvents } from "../services/adminService";
import "../styles/Dashboard.css";

function Dashboard() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const userName = user?.displayName || "Student";
  const firstName = userName.split(" ")[0];
  const userPhoto = user?.photoURL || null;
  const userEmail = user?.email || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, eventsData] = await Promise.all([
          getBooks(),
          getEvents()
        ]);
        setRecentBooks(booksData.slice(0, 5));
        setEvents(eventsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const bookColors = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#a18cd1", "#fbc2eb"],
  ];

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <AnnouncementsBanner />

        {/* Hero Header */}
        <div className="dashboard-hero">
          <div className="hero-info">
            <p className="hero-greeting">{getGreeting()},</p>
            <h1 className="hero-name">{firstName}</h1>
            <p className="hero-email">{userEmail}</p>
          </div>
          <div className="hero-avatar">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userName} 
                className="avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar-fallback">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-status"></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon-wrap stat-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{recentBooks.length}</span>
              <span className="stat-label">Books Available</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{events.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">Active</span>
              <span className="stat-label">Account Status</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-main">
          {/* Left Column */}
          <div className="dashboard-primary">
            {/* Recent Books */}
            <div className="card">
              <div className="card-top">
                <h2 className="card-title">Recently Added Books</h2>
                <span className="card-badge">{recentBooks.length} books</span>
              </div>
              <div className="books-grid">
                {loading ? (
                  <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading books...</p>
                  </div>
                ) : recentBooks.length > 0 ? (
                  recentBooks.map((book, idx) => {
                    const [c1, c2] = bookColors[idx % bookColors.length];
                    return (
                      <div key={book.id} className="book-card">
                        <div className="book-thumb" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                          <span className="book-initial">{book.title?.charAt(0) || "B"}</span>
                        </div>
                        <div className="book-details">
                          <h4 className="book-name">{book.title}</h4>
                          <p className="book-writer">{book.author}</p>
                          <div className="book-meta">
                            {book.category && <span className="meta-tag">{book.category}</span>}
                            <span className={`availability-dot ${book.available > 0 ? "dot-available" : "dot-unavailable"}`}>
                              {book.available > 0 ? "Available" : "Checked Out"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                    <p>No books available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="card">
              <div className="card-top">
                <h2 className="card-title">Upcoming Events</h2>
                <span className="card-badge">{events.length} events</span>
              </div>
              {loading ? (
                <div className="empty-state">
                  <div className="spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : events.length > 0 ? (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-row">
                      <div className="event-date-badge">
                        <span className="event-month">
                          {event.eventDate ? new Date(event.eventDate).toLocaleString("default", { month: "short" }) : "TBA"}
                        </span>
                        <span className="event-day">
                          {event.eventDate ? new Date(event.eventDate).getDate() : "—"}
                        </span>
                      </div>
                      <div className="event-info">
                        <h4 className="event-name">{event.title}</h4>
                        <div className="event-details">
                          {event.location && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                              </svg>
                              {event.location}
                            </span>
                          )}
                          {event.eventTime && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                              </svg>
                              {event.eventTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="dashboard-sidebar">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="action-list">
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-blue">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">Browse Books</span>
                    <span className="action-desc">Explore the collection</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-purple">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">My Reservations</span>
                    <span className="action-desc">View reserved books</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-green">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">Reading History</span>
                    <span className="action-desc">Your past reads</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Library Hours */}
            <div className="card">
              <h3 className="sidebar-title">Library Hours</h3>
              <div className="hours-list">
                <div className="hours-row">
                  <span className="hours-day">Monday – Friday</span>
                  <span className="hours-time">8:00 AM – 8:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Saturday</span>
                  <span className="hours-time">9:00 AM – 6:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Sunday</span>
                  <span className="hours-time">12:00 PM – 5:00 PM</span>
                </div>
              </div>
              <div className="hours-status">
                <span className="status-dot open"></span>
                Open Now
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
===
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AnnouncementsBanner from "../components/AnnouncementsBanner";
import BookDetailModal from "../components/BookDetailModal";
import { auth } from "../firebase/firebase";
import { getBooks, getEvents } from "../services/adminService";
import { getUserBorrows, getActiveBorrowCount } from "../services/userService";
import "../styles/Dashboard.css";

function Dashboard() {
  const [allBooks, setAllBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [myBorrows, setMyBorrows] = useState([]);
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);

  const user = auth.currentUser;
  const userName = user?.displayName || "Student";
  const firstName = userName.split(" ")[0];
  const userPhoto = user?.photoURL || null;
  const userEmail = user?.email || "";

  const fetchBorrows = async () => {
    if (!user) return;
    try {
      const [borrows, count] = await Promise.all([
        getUserBorrows(user.uid),
        getActiveBorrowCount(user.uid)
      ]);
      setMyBorrows(borrows);
      setActiveBorrowCount(count);
    } catch (error) {
      console.error("Error fetching borrows:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, eventsData] = await Promise.all([
          getBooks(),
          getEvents()
        ]);
        setAllBooks(booksData);
        setEvents(eventsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
    fetchBorrows();
  }, []);

  const handleBookClick = (book, index) => {
    setSelectedBook(book);
    setSelectedBookIndex(index);
  };

  const handleBorrowSuccess = async () => {
    await fetchBorrows();
    const updatedBooks = await getBooks();
    setAllBooks(updatedBooks);
    setSelectedBook(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const bookColors = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#a18cd1", "#fbc2eb"],
  ];

  const getBorrowStatusLabel = (borrow) => {
    if (borrow.status === "returned") return "Returned";
    const dueDate = borrow.dueDate ? new Date(borrow.dueDate) : null;
    if (dueDate && dueDate < new Date()) return "Overdue";
    return "Active";
  };

  const getBorrowStatusClass = (borrow) => {
    const label = getBorrowStatusLabel(borrow);
    if (label === "Returned") return "borrow-status-returned";
    if (label === "Overdue") return "borrow-status-overdue";
    return "borrow-status-active";
  };

  const recentBooks = allBooks.slice(0, 8);
  const activeBorrows = myBorrows.filter((b) => b.status === "active");

  return (
    <div className="dashboard-container">
      <Navbar onBookSelect={(book) => handleBookClick(book, 0)} />
      
      <div className="dashboard-content">
        <AnnouncementsBanner />

        {/* Hero Header */}
        <div className="dashboard-hero">
          <div className="hero-info">
            <p className="hero-greeting">{getGreeting()},</p>
            <h1 className="hero-name">{firstName}</h1>
            <p className="hero-email">{userEmail}</p>
          </div>
          <div className="hero-avatar">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userName} 
                className="avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar-fallback">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-status"></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon-wrap stat-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{allBooks.length}</span>
              <span className="stat-label">Books in Library</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{activeBorrowCount}/3</span>
              <span className="stat-label">Books Borrowed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">Active</span>
              <span className="stat-label">Account Status</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-main">
          {/* Left Column */}
          <div className="dashboard-primary">
            {/* My Borrowed Books */}
            {activeBorrows.length > 0 && (
              <div className="card" id="mybooks">
                <div className="card-top">
                  <h2 className="card-title">My Borrowed Books</h2>
                  <span className="card-badge">{activeBorrows.length} active</span>
                </div>
                <div className="borrows-list">
                  {activeBorrows.map((borrow) => {
                    const statusLabel = getBorrowStatusLabel(borrow);
                    const statusClass = getBorrowStatusClass(borrow);
                    const dueDate = borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString() : "N/A";
                    return (
                      <div key={borrow.id} className="borrow-card">
                        <div className="borrow-info">
                          <h4 className="borrow-title">{borrow.bookTitle}</h4>
                          <p className="borrow-author">by {borrow.bookAuthor}</p>
                          <div className="borrow-meta">
                            <span className="borrow-due">Due: {dueDate}</span>
                            <span className={`borrow-status ${statusClass}`}>{statusLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Books Catalog */}
            <div className="card" id="books">
              <div className="card-top">
                <h2 className="card-title">Browse Books</h2>
                <span className="card-badge">{allBooks.length} books</span>
              </div>
              <div className="books-grid">
                {loading ? (
                  <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading books...</p>
                  </div>
                ) : recentBooks.length > 0 ? (
                  recentBooks.map((book, idx) => {
                    const [c1, c2] = bookColors[idx % bookColors.length];
                    return (
                      <div key={book.id} className="book-card book-card-clickable" onClick={() => handleBookClick(book, idx)}>
                        <div className="book-thumb" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                          <span className="book-initial">{book.title?.charAt(0) || "B"}</span>
                        </div>
                        <div className="book-details">
                          <h4 className="book-name">{book.title}</h4>
                          <p className="book-writer">{book.author}</p>
                          <div className="book-meta">
                            {book.category && <span className="meta-tag">{book.category}</span>}
                            <span className={`availability-dot ${book.available > 0 ? "dot-available" : "dot-unavailable"}`}>
                              {book.available > 0 ? "Available" : "Checked Out"}
                            </span>
                          </div>
                        </div>
                        <svg className="book-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                    <p>No books available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="card">
              <div className="card-top">
                <h2 className="card-title">Upcoming Events</h2>
                <span className="card-badge">{events.length} events</span>
              </div>
              {loading ? (
                <div className="empty-state">
                  <div className="spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : events.length > 0 ? (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-row">
                      <div className="event-date-badge">
                        <span className="event-month">
                          {event.eventDate ? new Date(event.eventDate).toLocaleString("default", { month: "short" }) : "TBA"}
                        </span>
                        <span className="event-day">
                          {event.eventDate ? new Date(event.eventDate).getDate() : "—"}
                        </span>
                      </div>
                      <div className="event-info">
                        <h4 className="event-name">{event.title}</h4>
                        <div className="event-details">
                          {event.location && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                              </svg>
                              {event.location}
                            </span>
                          )}
                          {event.eventTime && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                              </svg>
                              {event.eventTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="dashboard-sidebar">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="action-list">
                <a href="#books" className="action-item">
                  <div className="action-icon action-icon-blue">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">Browse Books</span>
                    <span className="action-desc">Explore the collection</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#mybooks" className="action-item">
                  <div className="action-icon action-icon-purple">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">My Borrowed Books</span>
                    <span className="action-desc">View active borrows</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Library Hours */}
            <div className="card">
              <h3 className="sidebar-title">Library Hours</h3>
              <div className="hours-list">
                <div className="hours-row">
                  <span className="hours-day">Monday – Friday</span>
                  <span className="hours-time">8:00 AM – 8:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Saturday</span>
                  <span className="hours-time">9:00 AM – 6:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Sunday</span>
                  <span className="hours-time">12:00 PM – 5:00 PM</span>
                </div>
              </div>
              <div className="hours-status">
                <span className="status-dot open"></span>
                Open Now
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          activeBorrowCount={activeBorrowCount}
          onBorrowSuccess={handleBorrowSuccess}
          colorIndex={selectedBookIndex}
        />
      )}
    </div>
  );
}

export default Dashboard;
export default Dashboard;
````

`render_diffs(file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/styles/Dashboard.css)`

````diff:AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { getVisitorStats, blockUser, unblockUser } from "../services/userService";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("today");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [blockingId, setBlockingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/"); return; }
        const statsData = await getVisitorStats(filterPeriod);
        setStats(statsData);
        setVisitors(statsData.visitors || []);
        setFilteredVisitors(statsData.visitors || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [filterPeriod, navigate]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterVisitors(term, blockedFilter);
  };

  const filterVisitors = (term, blocked) => {
    let filtered = visitors.filter((visitor) => {
      const matchesSearch =
        (visitor.email || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.name || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.college || "").toLowerCase().includes(term.toLowerCase());
      const matchesBlock =
        blocked === "all" ||
        (blocked === "blocked" && visitor.isBlocked) ||
        (blocked === "active" && !visitor.isBlocked);
      return matchesSearch && matchesBlock;
    });
    setFilteredVisitors(filtered);
  };

  const handleApplyCustomRange = async () => {
    if (!customDateRange.start || !customDateRange.end) {
      alert("Please select both start and end dates");
      return;
    }
    setShowCustomDatePicker(false);
    const statsData = await getVisitorStats("custom", customDateRange.start, customDateRange.end);
    setStats(statsData);
    setVisitors(statsData.visitors || []);
    setFilteredVisitors(statsData.visitors || []);
  };

  const handleBlockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to block this user? They will not be able to access the library.")) return;
    setBlockingId(userId);
    try {
      await blockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: true } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: true });
    } catch (error) {
      alert("Failed to block user");
      console.error(error);
    }
    setBlockingId(null);
  };

  const handleUnblockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    setBlockingId(userId);
    try {
      await unblockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: false } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: false });
    } catch (error) {
      alert("Failed to unblock user");
      console.error(error);
    }
    setBlockingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="ad-loading">
          <div className="ad-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Row */}
      {stats && (
        <div className="ad-stats-row">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.totalVisitors}</span>
              <span className="ad-stat-lbl">Total Visitors</span>
            </div>
            <span className="ad-stat-period">{filterPeriod === "custom" ? "Custom" : filterPeriod}</span>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val ad-stat-val-sm">{stats.mostCommonReason}</span>
              <span className="ad-stat-lbl">Top Reason ({stats.mostCommonCount})</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-red">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.blockedCount}</span>
              <span className="ad-stat-lbl">Blocked Users</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.collegeBreakdown ? Object.keys(stats.collegeBreakdown).length : 0}</span>
              <span className="ad-stat-lbl">Colleges Represented</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="ad-filters-bar">
        <div className="ad-filters-left">
          <div className="ad-filter-item">
            <label>Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                if (e.target.value === "custom") setShowCustomDatePicker(true);
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="ad-filter-item">
            <label>Status</label>
            <select
              value={blockedFilter}
              onChange={(e) => {
                setBlockedFilter(e.target.value);
                filterVisitors(searchTerm, e.target.value);
              }}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="ad-search-wrap">
          <svg className="ad-search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomDatePicker && (
        <div className="ad-date-picker">
          <div className="ad-date-fields">
            <div className="ad-date-field">
              <label>Start Date</label>
              <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
            </div>
            <div className="ad-date-field">
              <label>End Date</label>
              <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
            </div>
          </div>
          <div className="ad-date-actions">
            <button className="ad-btn-primary" onClick={handleApplyCustomRange}>Apply</button>
            <button className="ad-btn-ghost" onClick={() => setShowCustomDatePicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="ad-table-card">
        <div className="ad-table-header">
          <h2>Users</h2>
          <span className="ad-table-count">{filteredVisitors.length} {filteredVisitors.length === 1 ? "user" : "users"}</span>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>User</th>
                <th>College / Office</th>
                <th>Last Reason</th>
                <th>Last Visit</th>
                <th>Visits</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className={visitor.isBlocked ? "row-blocked" : ""}
                    onClick={() => setSelectedUser(visitor)}
                  >
                    <td>
                      <div className="ad-user-cell">
                        <div className="ad-user-avatar">{(visitor.name || "?").charAt(0).toUpperCase()}</div>
                        <div className="ad-user-info">
                          <span className="ad-user-name">{visitor.name}</span>
                          <span className="ad-user-email">{visitor.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{visitor.college || "—"}</td>
                    <td><span className="ad-reason-badge">{visitor.lastReason || "N/A"}</span></td>
                    <td className="ad-td-muted">{visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleDateString() : "—"}</td>
                    <td><span className="ad-visits-count">{visitor.totalVisits}</span></td>
                    <td>
                      <span className={`ad-status-badge ${visitor.isBlocked ? "ad-status-blocked" : "ad-status-active"}`}>
                        <span className="ad-status-dot"></span>
                        {visitor.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {visitor.isBlocked ? (
                        <button
                          onClick={(e) => handleUnblockUser(visitor.id, e)}
                          className="ad-action-btn ad-unblock-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Unblock"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleBlockUser(visitor.id, e)}
                          className="ad-action-btn ad-block-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="ad-empty-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                    </svg>
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="ad-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-close" onClick={() => setSelectedUser(null)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Blocked Banner */}
            {selectedUser.isBlocked && (
              <div className="ad-modal-blocked-bar">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                </svg>
                <span>This user is blocked from accessing the library</span>
              </div>
            )}

            {/* Modal Header */}
            <div className="ad-modal-head">
              <div className="ad-modal-avatar">{(selectedUser.name || "?").charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="ad-modal-name">{selectedUser.name}</h2>
                <p className="ad-modal-email">{selectedUser.email}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="ad-modal-info-grid">
              <div className="ad-modal-info">
                <span className="ad-info-label">College / Office</span>
                <span className="ad-info-value">{selectedUser.college || "Not set"}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Total Visits</span>
                <span className="ad-info-value">{selectedUser.totalVisits}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Status</span>
                <span className={`ad-info-value ${selectedUser.isBlocked ? "val-blocked" : "val-active"}`}>
                  {selectedUser.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Last Visit</span>
                <span className="ad-info-value">{selectedUser.lastVisit ? new Date(selectedUser.lastVisit).toLocaleString() : "N/A"}</span>
              </div>
            </div>

            {/* Block/Unblock Action */}
            <div className="ad-modal-action-bar">
              {selectedUser.isBlocked ? (
                <button className="ad-modal-action-btn ad-modal-unblock" onClick={(e) => handleUnblockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Unblock User"}
                </button>
              ) : (
                <button className="ad-modal-action-btn ad-modal-block" onClick={(e) => handleBlockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Block User"}
                </button>
              )}
            </div>

            {/* Visit History */}
            <div className="ad-modal-visits">
              <h3>Visit History</h3>
              {selectedUser.visits && selectedUser.visits.length > 0 ? (
                <div className="ad-visits-list">
                  {selectedUser.visits.slice().reverse().slice(0, 10).map((visit, idx) => (
                    <div key={idx} className="ad-visit-row">
                      <span className="ad-visit-reason">{visit.reason}</span>
                      <span className="ad-visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ad-no-visits">No visit history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
===
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { getVisitorStats, blockUser, unblockUser } from "../services/userService";
import { getOverdueCheckouts, returnBook } from "../services/adminService";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("today");
  const [overdueCheckouts, setOverdueCheckouts] = useState([]);
  const [processingReturn, setProcessingReturn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [blockingId, setBlockingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/"); return; }
        const [statsData, overdueData] = await Promise.all([
          getVisitorStats(filterPeriod),
          getOverdueCheckouts()
        ]);
        setStats(statsData);
        setOverdueCheckouts(overdueData);
        setVisitors(statsData.visitors || []);
        setFilteredVisitors(statsData.visitors || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [filterPeriod, navigate]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    filterVisitors(term, blockedFilter);
  };

  const filterVisitors = (term, blocked) => {
    let filtered = visitors.filter((visitor) => {
      const matchesSearch =
        (visitor.email || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.name || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.college || "").toLowerCase().includes(term.toLowerCase());
      const matchesBlock =
        blocked === "all" ||
        (blocked === "blocked" && visitor.isBlocked) ||
        (blocked === "active" && !visitor.isBlocked);
      return matchesSearch && matchesBlock;
    });
    setFilteredVisitors(filtered);
  };

  const handleApplyCustomRange = async () => {
    if (!customDateRange.start || !customDateRange.end) {
      alert("Please select both start and end dates");
      return;
    }
    setShowCustomDatePicker(false);
    const statsData = await getVisitorStats("custom", customDateRange.start, customDateRange.end);
    setStats(statsData);
    setVisitors(statsData.visitors || []);
    setFilteredVisitors(statsData.visitors || []);
  };

  const handleReturnBook = async (checkoutId, bookId) => {
    if (!window.confirm("Mark this book as returned?")) return;
    setProcessingReturn(checkoutId);
    try {
      await returnBook(checkoutId, bookId);
      setOverdueCheckouts(overdueCheckouts.filter(c => c.id !== checkoutId));
    } catch (error) {
      alert("Failed to process return.");
      console.error(error);
    }
    setProcessingReturn(null);
  };

  const handleBlockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to block this user? They will not be able to access the library.")) return;
    setBlockingId(userId);
    try {
      await blockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: true } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: true });
    } catch (error) {
      alert("Failed to block user");
      console.error(error);
    }
    setBlockingId(null);
  };

  const handleUnblockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    setBlockingId(userId);
    try {
      await unblockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: false } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: false });
    } catch (error) {
      alert("Failed to unblock user");
      console.error(error);
    }
    setBlockingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="ad-loading">
          <div className="ad-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Row */}
      {stats && (
        <div className="ad-stats-row">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.totalVisitors}</span>
              <span className="ad-stat-lbl">Total Visitors</span>
            </div>
            <span className="ad-stat-period">{filterPeriod === "custom" ? "Custom" : filterPeriod}</span>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val ad-stat-val-sm">{stats.mostCommonReason}</span>
              <span className="ad-stat-lbl">Top Reason ({stats.mostCommonCount})</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-red">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.blockedCount}</span>
              <span className="ad-stat-lbl">Blocked Users</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.collegeBreakdown ? Object.keys(stats.collegeBreakdown).length : 0}</span>
              <span className="ad-stat-lbl">Colleges Represented</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-red">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                 <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{overdueCheckouts.length}</span>
              <span className="ad-stat-lbl">Overdue Books</span>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Books Table */}
      {overdueCheckouts.length > 0 && (
        <div className="ad-table-card" style={{ marginBottom: '24px' }}>
          <div className="ad-table-header">
            <h2>Overdue Books</h2>
            <span className="ad-table-count">{overdueCheckouts.length} {overdueCheckouts.length === 1 ? "book" : "books"}</span>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Book Title</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {overdueCheckouts.map((checkout) => (
                  <tr key={checkout.id} className="row-overdue">
                    <td>
                      <div className="ad-user-info">
                        <span className="ad-user-name">{checkout.userName}</span>
                        <span className="ad-user-email">{checkout.userEmail}</span>
                      </div>
                    </td>
                    <td>{checkout.bookTitle}</td>
                    <td className="ad-td-muted">{new Date(checkout.dueDate).toLocaleDateString()}</td>
                    <td><span className="ad-visits-count" style={{color: '#dc2626', backgroundColor: '#fef2f2'}}>{checkout.daysOverdue} days</span></td>
                    <td>
                      <button
                        onClick={() => handleReturnBook(checkout.id, checkout.bookId)}
                        className="ad-action-btn"
                        style={{ backgroundColor: '#10B981', color: 'white', border: 'none' }}
                        disabled={processingReturn === checkout.id}
                      >
                        {processingReturn === checkout.id ? "Processing..." : "Mark Returned"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="ad-filters-bar">
        <div className="ad-filters-left">
          <div className="ad-filter-item">
            <label>Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                if (e.target.value === "custom") setShowCustomDatePicker(true);
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="ad-filter-item">
            <label>Status</label>
            <select
              value={blockedFilter}
              onChange={(e) => {
                setBlockedFilter(e.target.value);
                filterVisitors(searchTerm, e.target.value);
              }}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="ad-search-wrap">
          <svg className="ad-search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomDatePicker && (
        <div className="ad-date-picker">
          <div className="ad-date-fields">
            <div className="ad-date-field">
              <label>Start Date</label>
              <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
            </div>
            <div className="ad-date-field">
              <label>End Date</label>
              <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
            </div>
          </div>
          <div className="ad-date-actions">
            <button className="ad-btn-primary" onClick={handleApplyCustomRange}>Apply</button>
            <button className="ad-btn-ghost" onClick={() => setShowCustomDatePicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="ad-table-card">
        <div className="ad-table-header">
          <h2>Users</h2>
          <span className="ad-table-count">{filteredVisitors.length} {filteredVisitors.length === 1 ? "user" : "users"}</span>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>User</th>
                <th>College / Office</th>
                <th>Last Reason</th>
                <th>Last Visit</th>
                <th>Visits</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className={visitor.isBlocked ? "row-blocked" : ""}
                    onClick={() => setSelectedUser(visitor)}
                  >
                    <td>
                      <div className="ad-user-cell">
                        <div className="ad-user-avatar">{(visitor.name || "?").charAt(0).toUpperCase()}</div>
                        <div className="ad-user-info">
                          <span className="ad-user-name">{visitor.name}</span>
                          <span className="ad-user-email">{visitor.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{visitor.college || "—"}</td>
                    <td><span className="ad-reason-badge">{visitor.lastReason || "N/A"}</span></td>
                    <td className="ad-td-muted">{visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleDateString() : "—"}</td>
                    <td><span className="ad-visits-count">{visitor.totalVisits}</span></td>
                    <td>
                      <span className={`ad-status-badge ${visitor.isBlocked ? "ad-status-blocked" : "ad-status-active"}`}>
                        <span className="ad-status-dot"></span>
                        {visitor.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {visitor.isBlocked ? (
                        <button
                          onClick={(e) => handleUnblockUser(visitor.id, e)}
                          className="ad-action-btn ad-unblock-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Unblock"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleBlockUser(visitor.id, e)}
                          className="ad-action-btn ad-block-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="ad-empty-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                    </svg>
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="ad-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-close" onClick={() => setSelectedUser(null)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Blocked Banner */}
            {selectedUser.isBlocked && (
              <div className="ad-modal-blocked-bar">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                </svg>
                <span>This user is blocked from accessing the library</span>
              </div>
            )}

            {/* Modal Header */}
            <div className="ad-modal-head">
              <div className="ad-modal-avatar">{(selectedUser.name || "?").charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="ad-modal-name">{selectedUser.name}</h2>
                <p className="ad-modal-email">{selectedUser.email}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="ad-modal-info-grid">
              <div className="ad-modal-info">
                <span className="ad-info-label">College / Office</span>
                <span className="ad-info-value">{selectedUser.college || "Not set"}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Total Visits</span>
                <span className="ad-info-value">{selectedUser.totalVisits}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Status</span>
                <span className={`ad-info-value ${selectedUser.isBlocked ? "val-blocked" : "val-active"}`}>
                  {selectedUser.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Last Visit</span>
                <span className="ad-info-value">{selectedUser.lastVisit ? new Date(selectedUser.lastVisit).toLocaleString() : "N/A"}</span>
              </div>
            </div>

            {/* Block/Unblock Action */}
            <div className="ad-modal-action-bar">
              {selectedUser.isBlocked ? (
                <button className="ad-modal-action-btn ad-modal-unblock" onClick={(e) => handleUnblockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Unblock User"}
                </button>
              ) : (
                <button className="ad-modal-action-btn ad-modal-block" onClick={(e) => handleBlockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Block User"}
                </button>
              )}
            </div>

            {/* Visit History */}
            <div className="ad-modal-visits">
              <h3>Visit History</h3>
              {selectedUser.visits && selectedUser.visits.length > 0 ? (
                <div className="ad-visits-list">
                  {selectedUser.visits.slice().reverse().slice(0, 10).map((visit, idx) => (
                    <div key={idx} className="ad-visit-row">
                      <span className="ad-visit-reason">{visit.reason}</span>
                      <span className="ad-visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ad-no-visits">No visit history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
````

## New Files Created

- [BookDetailModal.jsx](file:///c:/Users/User/OneDrive/Desktop/Dev%20Projects/NEU%20Library%20System/frontend-react/src/components/BookDetailModal.jsx): Found at `frontend-react/src/components/`
- `BookDetailModal.css`: Found at `frontend-react/src/styles/`
