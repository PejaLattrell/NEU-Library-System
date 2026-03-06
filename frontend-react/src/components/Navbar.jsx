import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

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
          <span className="logo-icon">📚</span>
          <span className="logo-text">NEU Library</span>
        </Link>

        <div className="nav-menu">
          <button onClick={handleDashboardClick} className="nav-item active" style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span className="nav-icon">🏠</span>
            Dashboard
          </button>
          {userRole !== "admin" && (
            <>
              <a href="#books" className="nav-item">
                <span className="nav-icon">🔍</span>
                Browse Books
              </a>
              <a href="#mybooks" className="nav-item">
                <span className="nav-icon">📖</span>
                My Books
              </a>
            </>
          )}
          <a href="#help" className="nav-item">
            <span className="nav-icon">❓</span>
            Help
          </a>
        </div>

        <div className="navbar-right">
          {userRole !== "admin" && (
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search books..." 
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;