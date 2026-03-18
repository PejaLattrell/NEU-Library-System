
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
                        onClick={() => handleResultClick(book)}
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