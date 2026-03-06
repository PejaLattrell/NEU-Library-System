import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { updateUserProfile } from "../services/userService";
import "../styles/SetupProfile.css";

const COLLEGES = [
  "College of Engineering",
  "College of Education",
  "College of Liberal Arts",
  "College of Sciences",
  "College of Business and Accountancy",
  "College of Health Sciences",
  "College of Architecture and Design",
  "College of Information Technology",
  "Office of the President",
  "Administrative Office",
  "Other"
];

function SetupProfile() {
  const navigate = useNavigate();
  const [selectedCollege, setSelectedCollege] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedCollege) {
      setError("Please select your college or office");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (user) {
        await updateUserProfile(user.uid, {
          college: selectedCollege
        });
        
        navigate("/select-reason");
      }
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <h1 className="setup-title">Welcome to NEU Library!</h1>
          <p className="setup-subtitle">First-time visitor? Let's get to know you</p>
        </div>

        <div className="setup-content">
          <div className="form-group">
            <label className="form-label">Select Your College/Office</label>
            <p className="form-hint">This helps us understand our student community better</p>
            
            <div className="college-grid">
              {COLLEGES.map((college) => (
                <button
                  key={college}
                  className={`college-option ${selectedCollege === college ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedCollege(college);
                    setError("");
                  }}
                >
                  <span className="option-icon">🏛️</span>
                  <span className="option-name">{college}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}
          </div>

          <div className="setup-actions">
            <button
              onClick={handleContinue}
              className="continue-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
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

export default SetupProfile;
