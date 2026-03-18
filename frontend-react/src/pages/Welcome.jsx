import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import "../styles/Welcome.css";

function Welcome() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const userName = user
    ? (user.displayName ? user.displayName.split(" ")[0] : user.email)
    : "";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="modern-welcome-container">
      <div className="modern-welcome-card">
        <div className="welcome-animation-container">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>

        <h1 className="modern-welcome-title">Welcome to NEU Library!</h1>
        
        {userName && (
          <p className="modern-welcome-greeting">
            Hello, <strong>{userName}</strong>! Enjoy your time in the library.
          </p>
        )}
        
        <div className="redirect-section">
           <p className="redirect-text">Redirecting to your dashboard...</p>
           <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
