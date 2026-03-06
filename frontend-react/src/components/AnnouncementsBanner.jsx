import { useState, useEffect } from "react";
import { getAnnouncements } from "../services/adminService";
import "../styles/AnnouncementsBanner.css";

function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
    // Refresh announcements every 30 seconds
    const interval = setInterval(loadAnnouncements, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
    setLoading(false);
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  return (
    <div className="announcements-banner-container">
      <button
        className="announcements-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        📢 Announcements ({announcements.length})
        <span className={`toggle-icon ${expanded ? "open" : ""}`}>▼</span>
      </button>

      {expanded && (
        <div className="announcements-expanded">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`announcement-item priority-${announcement.priority}`}
            >
              <div className="announcement-header">
                <h4>{announcement.title}</h4>
                <span className={`priority-badge ${announcement.priority}`}>
                  {announcement.priority?.toUpperCase()}
                </span>
              </div>
              <p className="announcement-text">{announcement.content}</p>
              <p className="announcement-date">
                {announcement.createdAt?.toDate
                  ? new Date(announcement.createdAt.toDate()).toLocaleString()
                  : announcement.createdAt
                    ? new Date(announcement.createdAt).toLocaleString()
                    : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnnouncementsBanner;
