import { Link } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();

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
          <Link to="/dashboard" className="nav-item active">
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          <a href="#books" className="nav-item">
            <span className="nav-icon">🔍</span>
            Browse Books
          </a>
          <a href="#mybooks" className="nav-item">
            <span className="nav-icon">📖</span>
            My Books
          </a>
          <a href="#help" className="nav-item">
            <span className="nav-icon">❓</span>
            Help
          </a>
        </div>

        <div className="navbar-right">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search books..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;