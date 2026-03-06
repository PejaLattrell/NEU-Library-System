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
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-icon">Library</div>
        <h1 className="welcome-message">Welcome to NEU Library!</h1>
        {userName ? (
          <p className="welcome-greeting">
            Hello, {userName}! Enjoy your time in the library.
          </p>
        ) : null}
        <p className="welcome-redirect">Redirecting you to your dashboard...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
