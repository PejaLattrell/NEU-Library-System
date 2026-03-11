import { useState } from "react";
import { auth } from "../firebase/firebase";
import { borrowBook } from "../services/userService";
import "../styles/BookDetailModal.css";

const bookColors = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#43e97b", "#38f9d7"],
  ["#fa709a", "#fee140"],
  ["#a18cd1", "#fbc2eb"],
];

function BookDetailModal({ book, onClose, activeBorrowCount, onBorrowSuccess, colorIndex = 0 }) {
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    borrowDate: "",
    borrowTime: "",
    duration: 7
  });

  const MAX_BORROWS = 3;
  const isAvailable = (book.available || 0) > 0;
  const canBorrow = isAvailable && activeBorrowCount < MAX_BORROWS;
  const [c1, c2] = bookColors[colorIndex % bookColors.length];

  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const handleSubmit = async () => {
    if (!formData.borrowDate || !formData.borrowTime) {
      setError("Please fill in the pickup date and time.");
      return;
    }

    if (formData.duration < 1 || formData.duration > 30) {
      setError("Borrow duration must be between 1 and 30 days.");
      return;
    }

    setBorrowing(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to borrow books.");
        return;
      }

      await borrowBook(user.uid, book, formData);
      setSuccess("Book borrowed successfully! Check your borrowed books on the dashboard.");
      setShowBorrowForm(false);

      setTimeout(() => {
        if (onBorrowSuccess) onBorrowSuccess();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to borrow book. Please try again.");
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <div className="bdm-overlay" onClick={onClose}>
      <div className="bdm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bdm-close" onClick={onClose}>
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>

        {/* Book Header */}
        <div className="bdm-header">
          <div className="bdm-thumb" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
            <span className="bdm-initial">{book.title?.charAt(0) || "B"}</span>
          </div>
          <div className="bdm-header-info">
            <h2 className="bdm-title">{book.title}</h2>
            <p className="bdm-author">by {book.author}</p>
            <div className="bdm-tags">
              {book.category && <span className="bdm-tag">{book.category}</span>}
              <span className={`bdm-avail ${isAvailable ? "bdm-avail-yes" : "bdm-avail-no"}`}>
                <span className="bdm-avail-dot"></span>
                {isAvailable ? `${book.available} Available` : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Book Details */}
        <div className="bdm-details">
          {book.isbn && (
            <div className="bdm-detail-row">
              <span className="bdm-label">ISBN</span>
              <span className="bdm-value">{book.isbn}</span>
            </div>
          )}
          <div className="bdm-detail-row">
            <span className="bdm-label">Total Copies</span>
            <span className="bdm-value">{book.quantity || "N/A"}</span>
          </div>
          {book.description && (
            <div className="bdm-description">
              <span className="bdm-label">Description</span>
              <p>{book.description}</p>
            </div>
          )}
        </div>

        {/* Borrow Status */}
        <div className="bdm-borrow-status">
          <div className="bdm-borrow-count">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
            </svg>
            <span>{activeBorrowCount}/{MAX_BORROWS} books borrowed</span>
          </div>
          {activeBorrowCount >= MAX_BORROWS && (
            <p className="bdm-limit-warn">You've reached the maximum borrow limit. Return a book to borrow more.</p>
          )}
        </div>

        {/* Messages */}
        {error && <div className="bdm-error">{error}</div>}
        {success && <div className="bdm-success">{success}</div>}

        {/* Borrow Form */}
        {showBorrowForm && !success ? (
          <div className="bdm-form">
            <h3>Borrow Request</h3>
            <div className="bdm-form-grid">
              <div className="bdm-form-group">
                <label>Pickup Date *</label>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={formData.borrowDate}
                  onChange={(e) => setFormData({ ...formData, borrowDate: e.target.value })}
                />
              </div>
              <div className="bdm-form-group">
                <label>Pickup Time *</label>
                <input
                  type="time"
                  value={formData.borrowTime}
                  onChange={(e) => setFormData({ ...formData, borrowTime: e.target.value })}
                />
              </div>
              <div className="bdm-form-group">
                <label>Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                />
              </div>
              <div className="bdm-form-group">
                <label>Return By</label>
                <input
                  type="text"
                  readOnly
                  value={
                    formData.borrowDate && formData.duration
                      ? (() => {
                          const d = new Date(formData.borrowDate);
                          d.setDate(d.getDate() + Number(formData.duration));
                          return d.toLocaleDateString();
                        })()
                      : "Select a date and duration"
                  }
                  className="bdm-readonly"
                />
              </div>
            </div>
            <div className="bdm-form-actions">
              <button className="bdm-btn-confirm" onClick={handleSubmit} disabled={borrowing}>
                {borrowing ? "Processing..." : "Confirm Borrow"}
              </button>
              <button className="bdm-btn-cancel" onClick={() => setShowBorrowForm(false)} disabled={borrowing}>
                Cancel
              </button>
            </div>
          </div>
        ) : !success ? (
          <button
            className={`bdm-borrow-btn ${!canBorrow ? "bdm-borrow-disabled" : ""}`}
            disabled={!canBorrow}
            onClick={() => setShowBorrowForm(true)}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
            </svg>
            {!isAvailable ? "Currently Unavailable" : activeBorrowCount >= MAX_BORROWS ? "Borrow Limit Reached" : "Borrow This Book"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default BookDetailModal;
