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
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Section - Marquee Gallery */}
        <div className="login-gallery-section">
          <div className="gallery-header">
            <h3 className="gallery-title">Explore Our Collections</h3>
            <p className="gallery-subtitle">Discover thousands of books</p>
          </div>
          <div className="marquee-container">
            <div className="marquee-content">
              <div className="marquee-item">
                <img src={image} alt="NEU Library" className="marquee-image" />
              </div>
              <div className="marquee-item">
                <img src={bookMobile} alt="Book Mobile" className="marquee-image" />
              </div>
              <div className="marquee-item">
                <img src={library} alt="Library" className="marquee-image" />
              </div>
              <div className="marquee-item">
                <img src={image} alt="NEU Library" className="marquee-image" />
              </div>
              <div className="marquee-item">
                <img src={bookMobile} alt="Book Mobile" className="marquee-image" />
              </div>
              <div className="marquee-item">
                <img src={library} alt="Library" className="marquee-image" />
              </div>
            </div>
          </div>
          <div className="gallery-footer">
            <span className="gallery-badge">📚 2,500+ Books</span>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="login-form-wrapper">
          <div className="login-form-container">
            {/* Header */}
            <div className="login-header-new">
              <div className="logo-badge">
                <img 
                  src={logoImg}
                  alt="NEU Logo" 
                  className="logo-image"
                />
              </div>
              <h1 className="main-title">NEU Library</h1>
              <p className="main-subtitle">Smart Library Management System</p>
            </div>

            {/* Welcome Section */}
            <div className="welcome-section">
              <h2 className="welcome-title">Welcome Back!</h2>
              <p className="welcome-text">Sign in to your account and access your library portal</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {/* Login Button */}
            <div className="auth-section">
              <button 
                onClick={login} 
                className="google-login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </>
                )}
              </button>

              <div className="divider">
                <span>Quick Features</span>
              </div>

              {/* Features Grid */}
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">📖</span>
                  <span className="feature-name">Browse</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔖</span>
                  <span className="feature-name">Reserve</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⭐</span>
                  <span className="feature-name">Track</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">👤</span>
                  <span className="feature-name">Account</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="login-footer-new">
              <p className="footer-text">🔒 Secure login • Powered by Google Authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;