import { auth } from "../firebase/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { createUserIfNotExists } from "../services/userService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import image from "../assets/image.png";
import bookMobile from "../assets/bookMobile.png";
import library from "../assets/library.png";
import logoImg from "../assets/logo.png";
import "../styles/Login.css";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  hd: "neu.edu.ph",
  prompt: "select_account"
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isInstitutionalEmail = (email) => {
    return email.endsWith("@neu.edu.ph") || email.endsWith("@student.neu.edu.ph");
  };

  const login = async () => {
    try {
      setLoading(true);
      setError("");
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!isInstitutionalEmail(user.email)) {
        setError("Please use your institutional email (@neu.edu.ph)");
        await auth.signOut();
        setLoading(false);
        return;
      }

      const userData = await createUserIfNotExists(user);
      console.log("User data:", userData);

      if (userData.isBlocked) {
        setError("🚫 Access Denied. Your account has been blocked. Please contact the library admin for assistance.");
        await auth.signOut();
        setLoading(false);
        return;
      }

      if (userData.role === "admin") {
        navigate("/admin");
      } else {
        if (!userData.college) {
          navigate("/setup-profile");
        } else {
          navigate("/select-reason");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        setError("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="modern-login-container">
      {/* Left Column: Sleek Image Carousel */}
      <div className="login-left-column">
        <div className="login-image-carousel">
          <div className="carousel-slide slide-1">
            <img src={library} alt="Library Building" />
            <div className="slide-overlay">
              <h2>State of the Art Facility</h2>
              <p>Explore our extensive collection in a modern environment.</p>
            </div>
          </div>
          <div className="carousel-slide slide-2">
            <img src={bookMobile} alt="Mobile Book Bus" />
            <div className="slide-overlay">
              <h2>Library on the Go</h2>
              <p>Bringing knowledge directly to your community.</p>
            </div>
          </div>
          <div className="carousel-slide slide-3">
            <img src={image} alt="Books Collection" />
            <div className="slide-overlay">
              <h2>Vast Book Collection</h2>
              <p>Millions of resources tailored for your success.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Login Card */}
      <div className="login-right-column">
        <div className="modern-login-card">
          <div className="card-header">
            <img src={logoImg} alt="NEU Logo" className="brand-logo" />
            <h1 className="brand-title">New Era University Library</h1>
            <p className="brand-subtitle">Welcome! Please sign in to continue.</p>
          </div>

          {error && (
            <div className="login-error-alert">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="card-body">
            <button 
              className="modern-google-btn" 
              onClick={login} 
              disabled={loading}
            >
              {loading ? (
                <span className="modern-spinner"></span>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24" width="22" height="22">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="card-footer">
            <p>Institutional email (@neu.edu.ph) is required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;