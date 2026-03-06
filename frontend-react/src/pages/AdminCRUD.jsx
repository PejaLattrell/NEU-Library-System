import { useState, useEffect } from "react";
import { getBooks, addBook, updateBook, deleteBook, getEvents, addEvent, updateEvent, deleteEvent, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../services/adminService";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminCRUD.css";

function AdminCRUD() {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    quantity: 1,
    category: "",
    description: ""
  });

  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    capacity: ""
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: "normal"
  });

  // Load data on component mount and tab change
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "books") {
        const booksData = await getBooks();
        setBooks(booksData);
      } else if (activeTab === "events") {
        const eventsData = await getEvents();
        setEvents(eventsData);
      } else if (activeTab === "announcements") {
        const announcementsData = await getAnnouncements();
        setAnnouncements(announcementsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  // ==================== BOOKS ====================
  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      alert("Please fill in required fields");
      return;
    }
    try {
      if (editingId) {
        await updateBook(editingId, bookForm);
      } else {
        await addBook(bookForm);
      }
      setBooks(await getBooks());
      resetBookForm();
      setShowForm(false);
    } catch (error) {
      alert("Error saving book");
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(bookId);
        setBooks(await getBooks());
      } catch (error) {
        alert("Error deleting book");
      }
    }
  };

  const handleEditBook = (book) => {
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      quantity: book.quantity,
      category: book.category,
      description: book.description
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const resetBookForm = () => {
    setBookForm({
      title: "",
      author: "",
      isbn: "",
      quantity: 1,
      category: "",
      description: ""
    });
    setEditingId(null);
  };

  // ==================== EVENTS ====================
  const handleAddEvent = async () => {
    if (!eventForm.title || !eventForm.eventDate) {
      alert("Please fill in required fields");
      return;
    }
    try {
      if (editingId) {
        await updateEvent(editingId, eventForm);
      } else {
        await addEvent(eventForm);
      }
      setEvents(await getEvents());
      resetEventForm();
      setShowForm(false);
    } catch (error) {
      alert("Error saving event");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
        setEvents(await getEvents());
      } catch (error) {
        alert("Error deleting event");
      }
    }
  };

  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title,
      description: event.description,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location,
      capacity: event.capacity
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      capacity: ""
    });
    setEditingId(null);
  };

  // ==================== ANNOUNCEMENTS ====================
  const handleAddAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      alert("Please fill in required fields");
      return;
    }
    try {
      if (editingId) {
        await updateAnnouncement(editingId, announcementForm);
      } else {
        await createAnnouncement(announcementForm);
      }
      setAnnouncements(await getAnnouncements());
      resetAnnouncementForm();
      setShowForm(false);
    } catch (error) {
      alert("Error saving announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(announcementId);
        setAnnouncements(await getAnnouncements());
      } catch (error) {
        alert("Error deleting announcement");
      }
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || "normal"
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "normal"
    });
    setEditingId(null);
  };

  return (
    <AdminLayout title="📋 Library Management" subtitle="Manage books, events, and announcements">
      <div className="crud-content">

      {/* Tabs */}
      <div className="crud-tabs">
        <button
          className={`tab-btn ${activeTab === "books" ? "active" : ""}`}
          onClick={() => { setActiveTab("books"); setShowForm(false); resetBookForm(); }}
        >
          📚 Books
        </button>
        <button
          className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
          onClick={() => { setActiveTab("events"); setShowForm(false); resetEventForm(); }}
        >
          🎯 Events
        </button>
        <button
          className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
          onClick={() => { setActiveTab("announcements"); setShowForm(false); resetAnnouncementForm(); }}
        >
          📢 Announcements
        </button>
      </div>

      {/* Add New Button */}
      {!showForm && (
        <button
          className="add-new-btn"
          onClick={() => setShowForm(true)}
        >
          ➕ Add New {activeTab === "books" ? "Book" : activeTab === "events" ? "Event" : "Announcement"}
        </button>
      )}

      {loading && <div className="loading">Loading...</div>}

      {/* BOOKS TAB */}
      {activeTab === "books" && (
        <div className="tab-content">
          {showForm && (
            <div className="form-card">
              <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="Book title"
                />
              </div>
              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                  placeholder="Author name"
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={bookForm.isbn}
                  onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                  placeholder="ISBN number"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={bookForm.quantity}
                    onChange={(e) => setBookForm({ ...bookForm, quantity: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    placeholder="e.g., Fiction, Science"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  placeholder="Book description"
                ></textarea>
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleAddBook}>
                  {editingId ? "Update" : "Add"} Book
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { setShowForm(false); resetBookForm(); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="items-grid">
            {books.map((book) => (
              <div key={book.id} className="item-card">
                <h3>{book.title}</h3>
                <p className="item-subtitle">by {book.author}</p>
                {book.category && <p className="item-meta">📂 {book.category}</p>}
                {book.isbn && <p className="item-meta">📖 ISBN: {book.isbn}</p>}
                <p className="item-meta">📦 Quantity: {book.quantity}</p>
                {book.description && <p className="item-description">{book.description}</p>}
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEditBook(book)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteBook(book.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENTS TAB */}
      {activeTab === "events" && (
        <div className="tab-content">
          {showForm && (
            <div className="form-card">
              <h2>{editingId ? "Edit Event" : "Add New Event"}</h2>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="Event title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Event description"
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={eventForm.eventTime}
                    onChange={(e) => setEventForm({ ...eventForm, eventTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    value={eventForm.capacity}
                    onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                    placeholder="Max attendees"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleAddEvent}>
                  {editingId ? "Update" : "Add"} Event
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { setShowForm(false); resetEventForm(); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="items-grid">
            {events.map((event) => (
              <div key={event.id} className="item-card event-card">
                <h3>{event.title}</h3>
                <p className="item-meta">📅 {new Date(event.eventDate).toLocaleDateString()}</p>
                {event.eventTime && <p className="item-meta">⏰ {event.eventTime}</p>}
                {event.location && <p className="item-meta">📍 {event.location}</p>}
                {event.capacity && <p className="item-meta">👥 Capacity: {event.capacity}</p>}
                {event.description && <p className="item-description">{event.description}</p>}
                <div className="card-actions">
                  <button className="edit-btn" onClick={() => handleEditEvent(event)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === "announcements" && (
        <div className="tab-content">
          {showForm && (
            <div className="form-card">
              <h2>{editingId ? "Edit Announcement" : "Create New Announcement"}</h2>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  placeholder="Announcement content"
                  rows="5"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={announcementForm.priority}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleAddAnnouncement}>
                  {editingId ? "Update" : "Publish"} Announcement
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => { setShowForm(false); resetAnnouncementForm(); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="announcements-list">
            {announcements.map((announcement) => (
              <div key={announcement.id} className={`announcement-item priority-${announcement.priority}`}>
                <div className="announcement-header">
                  <h3>{announcement.title}</h3>
                  <span className="priority-badge">{announcement.priority?.toUpperCase()}</span>
                </div>
                <p className="announcement-content">{announcement.content}</p>
                <p className="announcement-time">
                  Posted: {new Date(announcement.createdAt.toDate()).toLocaleString()}
                </p>
                <div className="announcement-actions">
                  <button className="edit-btn" onClick={() => handleEditAnnouncement(announcement)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}

export default AdminCRUD;
