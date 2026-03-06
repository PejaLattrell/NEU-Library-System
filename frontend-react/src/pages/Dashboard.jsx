import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AnnouncementsBanner from "../components/AnnouncementsBanner";
import { auth } from "../firebase/firebase";
import { getBooks, getEvents } from "../services/adminService";
import "../styles/Dashboard.css";

function Dashboard() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  const userName = user?.displayName || "Student";
  const firstName = userName.split(" ")[0];
  const userPhoto = user?.photoURL || null;
  const userEmail = user?.email || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksData, eventsData] = await Promise.all([
          getBooks(),
          getEvents()
        ]);
        setRecentBooks(booksData.slice(0, 5));
        setEvents(eventsData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const bookColors = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#a18cd1", "#fbc2eb"],
  ];

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <AnnouncementsBanner />

        {/* Hero Header */}
        <div className="dashboard-hero">
          <div className="hero-info">
            <p className="hero-greeting">{getGreeting()},</p>
            <h1 className="hero-name">{firstName}</h1>
            <p className="hero-email">{userEmail}</p>
          </div>
          <div className="hero-avatar">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={userName} 
                className="avatar-img"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="avatar-fallback">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="avatar-status"></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon-wrap stat-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{recentBooks.length}</span>
              <span className="stat-label">Books Available</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">{events.length}</span>
              <span className="stat-label">Upcoming Events</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap stat-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="stat-text">
              <span className="stat-value">Active</span>
              <span className="stat-label">Account Status</span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="dashboard-main">
          {/* Left Column */}
          <div className="dashboard-primary">
            {/* Recent Books */}
            <div className="card">
              <div className="card-top">
                <h2 className="card-title">Recently Added Books</h2>
                <span className="card-badge">{recentBooks.length} books</span>
              </div>
              <div className="books-grid">
                {loading ? (
                  <div className="empty-state">
                    <div className="spinner"></div>
                    <p>Loading books...</p>
                  </div>
                ) : recentBooks.length > 0 ? (
                  recentBooks.map((book, idx) => {
                    const [c1, c2] = bookColors[idx % bookColors.length];
                    return (
                      <div key={book.id} className="book-card">
                        <div className="book-thumb" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                          <span className="book-initial">{book.title?.charAt(0) || "B"}</span>
                        </div>
                        <div className="book-details">
                          <h4 className="book-name">{book.title}</h4>
                          <p className="book-writer">{book.author}</p>
                          <div className="book-meta">
                            {book.category && <span className="meta-tag">{book.category}</span>}
                            <span className={`availability-dot ${book.available > 0 ? "dot-available" : "dot-unavailable"}`}>
                              {book.available > 0 ? "Available" : "Checked Out"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                    </svg>
                    <p>No books available yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="card">
              <div className="card-top">
                <h2 className="card-title">Upcoming Events</h2>
                <span className="card-badge">{events.length} events</span>
              </div>
              {loading ? (
                <div className="empty-state">
                  <div className="spinner"></div>
                  <p>Loading events...</p>
                </div>
              ) : events.length > 0 ? (
                <div className="events-list">
                  {events.map((event) => (
                    <div key={event.id} className="event-row">
                      <div className="event-date-badge">
                        <span className="event-month">
                          {event.eventDate ? new Date(event.eventDate).toLocaleString("default", { month: "short" }) : "TBA"}
                        </span>
                        <span className="event-day">
                          {event.eventDate ? new Date(event.eventDate).getDate() : "—"}
                        </span>
                      </div>
                      <div className="event-info">
                        <h4 className="event-name">{event.title}</h4>
                        <div className="event-details">
                          {event.location && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                              </svg>
                              {event.location}
                            </span>
                          )}
                          {event.eventTime && (
                            <span className="event-detail">
                              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                              </svg>
                              {event.eventTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                  </svg>
                  <p>No upcoming events</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="dashboard-sidebar">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <div className="action-list">
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-blue">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">Browse Books</span>
                    <span className="action-desc">Explore the collection</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-purple">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">My Reservations</span>
                    <span className="action-desc">View reserved books</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
                <a href="#" className="action-item">
                  <div className="action-icon action-icon-green">
                    <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="action-text">
                    <span className="action-name">Reading History</span>
                    <span className="action-desc">Your past reads</span>
                  </div>
                  <svg className="action-arrow" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Library Hours */}
            <div className="card">
              <h3 className="sidebar-title">Library Hours</h3>
              <div className="hours-list">
                <div className="hours-row">
                  <span className="hours-day">Monday – Friday</span>
                  <span className="hours-time">8:00 AM – 8:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Saturday</span>
                  <span className="hours-time">9:00 AM – 6:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Sunday</span>
                  <span className="hours-time">12:00 PM – 5:00 PM</span>
                </div>
              </div>
              <div className="hours-status">
                <span className="status-dot open"></span>
                Open Now
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;