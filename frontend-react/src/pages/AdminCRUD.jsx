import { useState, useEffect } from "react";
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from "../services/adminService";
import AdminLayout from "../components/AdminLayout";
import "../styles/AdminCRUD.css";

const createTempId = () => `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const toAnnouncementDateLabel = (createdAt) => {
  if (!createdAt) {
    return "";
  }

  if (typeof createdAt.toDate === "function") {
    return new Date(createdAt.toDate()).toLocaleString();
  }

  return new Date(createdAt).toLocaleString();
};

function AdminCRUD() {
  const [activeTab, setActiveTab] = useState("books");
  const [books, setBooks] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        if (activeTab === "books") {
          setBooks(await getBooks());
        } else if (activeTab === "events") {
          setEvents(await getEvents());
        } else {
          setAnnouncements(await getAnnouncements());
        }
      } catch (error) {
        setErrorMessage("Failed to load data. Please refresh.");
        console.error("Error loading admin data:", error);
      }

      setLoading(false);
    };

    loadData();
  }, [activeTab]);

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

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "normal"
    });
    setEditingId(null);
  };

  const closeForm = () => {
    setShowForm(false);
    if (activeTab === "books") {
      resetBookForm();
    } else if (activeTab === "events") {
      resetEventForm();
    } else {
      resetAnnouncementForm();
    }
  };

  const handleAddBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      setErrorMessage("Book title and author are required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const previous = books;

    try {
      if (editingId) {
        const optimisticBook = {
          ...books.find((book) => book.id === editingId),
          ...bookForm,
          id: editingId,
          _optimistic: true
        };

        setBooks((current) =>
          current.map((book) => (book.id === editingId ? optimisticBook : book))
        );

        await updateBook(editingId, bookForm);

        setBooks((current) =>
          current.map((book) =>
            book.id === editingId ? { ...book, _optimistic: false } : book
          )
        );
      } else {
        const tempId = createTempId();
        const optimisticBook = {
          ...bookForm,
          id: tempId,
          available: Number(bookForm.quantity || 0),
          _optimistic: true
        };

        setBooks((current) => [optimisticBook, ...current]);

        const savedBook = await addBook(bookForm);

        setBooks((current) =>
          current.map((book) =>
            book.id === tempId ? { ...savedBook, _optimistic: false } : book
          )
        );
      }

      closeForm();
    } catch (error) {
      setBooks(previous);
      setErrorMessage("Unable to save book. Changes were rolled back.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Delete this book?")) {
      return;
    }

    const previous = books;
    setErrorMessage("");
    setSaving(true);
    setBooks((current) => current.filter((book) => book.id !== bookId));

    try {
      await deleteBook(bookId);
    } catch (error) {
      setBooks(previous);
      setErrorMessage("Delete failed. Book list was restored.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleEditBook = (book) => {
    setBookForm({
      title: book.title || "",
      author: book.author || "",
      isbn: book.isbn || "",
      quantity: Number(book.quantity || 1),
      category: book.category || "",
      description: book.description || ""
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleAddEvent = async () => {
    if (!eventForm.title || !eventForm.eventDate) {
      setErrorMessage("Event title and date are required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const previous = events;

    try {
      if (editingId) {
        const optimisticEvent = {
          ...events.find((event) => event.id === editingId),
          ...eventForm,
          id: editingId,
          _optimistic: true
        };

        setEvents((current) =>
          current.map((event) => (event.id === editingId ? optimisticEvent : event))
        );

        await updateEvent(editingId, eventForm);

        setEvents((current) =>
          current.map((event) =>
            event.id === editingId ? { ...event, _optimistic: false } : event
          )
        );
      } else {
        const tempId = createTempId();
        const optimisticEvent = {
          ...eventForm,
          id: tempId,
          _optimistic: true
        };

        setEvents((current) => [optimisticEvent, ...current]);

        const savedEvent = await addEvent(eventForm);

        setEvents((current) =>
          current.map((event) =>
            event.id === tempId ? { ...savedEvent, _optimistic: false } : event
          )
        );
      }

      closeForm();
    } catch (error) {
      setEvents(previous);
      setErrorMessage("Unable to save event. Changes were rolled back.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    const previous = events;
    setSaving(true);
    setErrorMessage("");
    setEvents((current) => current.filter((event) => event.id !== eventId));

    try {
      await deleteEvent(eventId);
    } catch (error) {
      setEvents(previous);
      setErrorMessage("Delete failed. Event list was restored.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: event.eventDate || "",
      eventTime: event.eventTime || "",
      location: event.location || "",
      capacity: event.capacity || ""
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleAddAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.content) {
      setErrorMessage("Announcement title and content are required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const previous = announcements;

    try {
      if (editingId) {
        const optimisticAnnouncement = {
          ...announcements.find((item) => item.id === editingId),
          ...announcementForm,
          id: editingId,
          _optimistic: true
        };

        setAnnouncements((current) =>
          current.map((item) =>
            item.id === editingId ? optimisticAnnouncement : item
          )
        );

        await updateAnnouncement(editingId, announcementForm);

        setAnnouncements((current) =>
          current.map((item) =>
            item.id === editingId ? { ...item, _optimistic: false } : item
          )
        );
      } else {
        const tempId = createTempId();
        const optimisticAnnouncement = {
          ...announcementForm,
          id: tempId,
          createdAt: new Date().toISOString(),
          _optimistic: true
        };

        setAnnouncements((current) => [optimisticAnnouncement, ...current]);

        const savedAnnouncement = await createAnnouncement(announcementForm);

        setAnnouncements((current) =>
          current.map((item) =>
            item.id === tempId ? { ...savedAnnouncement, _optimistic: false } : item
          )
        );
      }

      closeForm();
    } catch (error) {
      setAnnouncements(previous);
      setErrorMessage("Unable to save announcement. Changes were rolled back.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) {
      return;
    }

    const previous = announcements;
    setSaving(true);
    setErrorMessage("");
    setAnnouncements((current) =>
      current.filter((item) => item.id !== announcementId)
    );

    try {
      await deleteAnnouncement(announcementId);
    } catch (error) {
      setAnnouncements(previous);
      setErrorMessage("Delete failed. Announcement list was restored.");
      console.error(error);
    }

    setSaving(false);
  };

  const handleEditAnnouncement = (announcement) => {
    setAnnouncementForm({
      title: announcement.title || "",
      content: announcement.content || "",
      priority: announcement.priority || "normal"
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowForm(false);
    setEditingId(null);
    setErrorMessage("");
  };

  return (
    <AdminLayout>
      <div className="crud-content">
        <div className="crud-tabs">
          <button
            className={`tab-btn ${activeTab === "books" ? "active" : ""}`}
            onClick={() => handleTabChange("books")}
          >
            Books
          </button>
          <button
            className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => handleTabChange("events")}
          >
            Events
          </button>
          <button
            className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => handleTabChange("announcements")}
          >
            Announcements
          </button>
        </div>

        {!showForm ? (
          <button
            className="add-new-btn"
            onClick={() => {
              setShowForm(true);
              setErrorMessage("");
            }}
          >
            Add New {activeTab === "books" ? "Book" : activeTab === "events" ? "Event" : "Announcement"}
          </button>
        ) : null}

        {errorMessage ? <div className="crud-error-banner">{errorMessage}</div> : null}
        {saving ? <div className="crud-info-banner">Syncing changes...</div> : null}
        {loading ? <div className="loading">Loading...</div> : null}

        {activeTab === "books" ? (
          <div className="tab-content">
            {showForm ? (
              <div className="form-card">
                <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(event) => setBookForm({ ...bookForm, title: event.target.value })}
                    placeholder="Book title"
                  />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(event) => setBookForm({ ...bookForm, author: event.target.value })}
                    placeholder="Author name"
                  />
                </div>
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(event) => setBookForm({ ...bookForm, isbn: event.target.value })}
                    placeholder="ISBN number"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={bookForm.quantity}
                      onChange={(event) => {
                        setBookForm({
                          ...bookForm,
                          quantity: Number(event.target.value || 0)
                        });
                      }}
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={bookForm.category}
                      onChange={(event) => {
                        setBookForm({ ...bookForm, category: event.target.value });
                      }}
                      placeholder="e.g. Fiction"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={bookForm.description}
                    onChange={(event) => {
                      setBookForm({ ...bookForm, description: event.target.value });
                    }}
                    placeholder="Book description"
                  />
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddBook} disabled={saving}>
                    {editingId ? "Update" : "Add"} Book
                  </button>
                  <button className="cancel-btn" onClick={closeForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="items-grid">
              {books.map((book) => (
                <div key={book.id} className={`item-card ${book._optimistic ? "item-card-pending" : ""}`}>
                  <h3>{book.title}</h3>
                  <p className="item-subtitle">by {book.author}</p>
                  {book.category ? <p className="item-meta">Category: {book.category}</p> : null}
                  {book.isbn ? <p className="item-meta">ISBN: {book.isbn}</p> : null}
                  <p className="item-meta">Quantity: {book.quantity}</p>
                  {book.description ? <p className="item-description">{book.description}</p> : null}
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEditBook(book)} disabled={saving}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteBook(book.id)} disabled={saving}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "events" ? (
          <div className="tab-content">
            {showForm ? (
              <div className="form-card">
                <h2>{editingId ? "Edit Event" : "Add New Event"}</h2>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(event) => setEventForm({ ...eventForm, title: event.target.value })}
                    placeholder="Event title"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(event) => setEventForm({ ...eventForm, description: event.target.value })}
                    placeholder="Event description"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Date *</label>
                    <input
                      type="date"
                      value={eventForm.eventDate}
                      onChange={(event) => setEventForm({ ...eventForm, eventDate: event.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="time"
                      value={eventForm.eventTime}
                      onChange={(event) => setEventForm({ ...eventForm, eventTime: event.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={eventForm.location}
                      onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      value={eventForm.capacity}
                      onChange={(event) => setEventForm({ ...eventForm, capacity: event.target.value })}
                      placeholder="Max attendees"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddEvent} disabled={saving}>
                    {editingId ? "Update" : "Add"} Event
                  </button>
                  <button className="cancel-btn" onClick={closeForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="items-grid">
              {events.map((event) => (
                <div key={event.id} className={`item-card event-card ${event._optimistic ? "item-card-pending" : ""}`}>
                  <h3>{event.title}</h3>
                  <p className="item-meta">Date: {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}</p>
                  {event.eventTime ? <p className="item-meta">Time: {event.eventTime}</p> : null}
                  {event.location ? <p className="item-meta">Location: {event.location}</p> : null}
                  {event.capacity ? <p className="item-meta">Capacity: {event.capacity}</p> : null}
                  {event.description ? <p className="item-description">{event.description}</p> : null}
                  <div className="card-actions">
                    <button className="edit-btn" onClick={() => handleEditEvent(event)} disabled={saving}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteEvent(event.id)} disabled={saving}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "announcements" ? (
          <div className="tab-content">
            {showForm ? (
              <div className="form-card">
                <h2>{editingId ? "Edit Announcement" : "Create Announcement"}</h2>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={announcementForm.title}
                    onChange={(event) => {
                      setAnnouncementForm({ ...announcementForm, title: event.target.value });
                    }}
                    placeholder="Announcement title"
                  />
                </div>
                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(event) => {
                      setAnnouncementForm({ ...announcementForm, content: event.target.value });
                    }}
                    placeholder="Announcement content"
                    rows="5"
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={(event) => {
                      setAnnouncementForm({ ...announcementForm, priority: event.target.value });
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="save-btn" onClick={handleAddAnnouncement} disabled={saving}>
                    {editingId ? "Update" : "Publish"} Announcement
                  </button>
                  <button className="cancel-btn" onClick={closeForm} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            <div className="announcements-list">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`announcement-item priority-${announcement.priority} ${announcement._optimistic ? "item-card-pending" : ""}`}
                >
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    <span className={`priority-badge ${announcement.priority}`}>
                      {(announcement.priority || "normal").toUpperCase()}
                    </span>
                  </div>
                  <p className="announcement-content">{announcement.content}</p>
                  <p className="announcement-time">
                    Posted: {toAnnouncementDateLabel(announcement.createdAt)}
                  </p>
                  <div className="announcement-actions">
                    <button className="edit-btn" onClick={() => handleEditAnnouncement(announcement)} disabled={saving}>
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}

export default AdminCRUD;

