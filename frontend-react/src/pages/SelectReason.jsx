import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { recordVisitReason } from "../services/userService";
import "../styles/SelectReason.css";

const VISIT_REASONS = [
  { id: "reading", label: "Reading", icon: "📚" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "computer", label: "Use of Computer", icon: "💻" },
  { id: "studying", label: "Studying", icon: "✏️" },
  { id: "meeting", label: "Meeting/Discussion", icon: "👥" },
  { id: "other", label: "Other", icon: "📝" }
];

function SelectReason() {
  const navigate = useNavigate();
  const [selectedReason, setSelectedReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEnter = async () => {
    if (!selectedReason) {
      setError("Please select a reason for visiting");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (user) {
        await recordVisitReason(user.uid, selectedReason);
        navigate("/welcome");
      }
    } catch (err) {
      setError("Failed to record your visit. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reason-container">
      <div className="reason-card">
        <div className="reason-header">
          <h1 className="reason-title">Welcome!</h1>
          <p className="reason-subtitle">Tell us why you're visiting today</p>
        </div>

        <div className="reason-content">
          <div className="reasons-grid">
            {VISIT_REASONS.map((reason) => (
              <button
                key={reason.id}
                className={`reason-option ${selectedReason === reason.id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedReason(reason.id);
                  setError("");
                }}
              >
                <span className="reason-icon">{reason.icon}</span>
                <span className="reason-name">{reason.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="reason-actions">
            <button
              onClick={handleEnter}
              className="enter-btn"
              disabled={loading}
            >
              {loading ? "Entering Library..." : "Enter Library"}
            </button>
            
            <button
              onClick={async () => {
                await auth.signOut();
                navigate("/");
              }}
              className="logout-btn"
              disabled={loading}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectReason;
