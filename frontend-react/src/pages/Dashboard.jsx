import Navbar from "../components/Navbar";
import "../styles/Dashboard.css";

function Dashboard() {
  const recentBooks = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", status: "Available" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", status: "Available" },
    { id: 3, title: "1984", author: "George Orwell", status: "Checked Out" },
  ];

  const categories = [
    { name: "Fiction", count: 245 },
    { name: "Science", count: 189 },
    { name: "History", count: 156 },
    { name: "Technology", count: 203 },
  ];

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to NEU Library System</p>
          </div>
          <img 
            src="https://via.placeholder.com/80x80/4F46E5/ffffff?text=Avatar" 
            alt="User Avatar" 
            className="user-avatar"
          />
        </div>

        <div className="dashboard-grid">
          {/* Stats Cards */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-icon books-icon">📖</div>
              <div className="stat-info">
                <p className="stat-label">Books Checked Out</p>
                <h3 className="stat-number">3</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon reserved-icon">🔖</div>
              <div className="stat-info">
                <p className="stat-label">Reserved Books</p>
                <h3 className="stat-number">2</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon due-icon">⏰</div>
              <div className="stat-info">
                <p className="stat-label">Due Soon</p>
                <h3 className="stat-number">1</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon fine-icon">💰</div>
              <div className="stat-info">
                <p className="stat-label">Outstanding Fines</p>
                <h3 className="stat-number">$0</h3>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-section">
            {/* Recent Books */}
            <div className="content-card">
              <div className="card-header">
                <h2>Recently Added Books</h2>
                <a href="#" className="view-all-link">View All →</a>
              </div>
              <div className="books-list">
                {recentBooks.map((book) => (
                  <div key={book.id} className="book-item">
                    <div className="book-cover">
                      <img 
                        src={`https://via.placeholder.com/60x90/E2E8F0/000000?text=${book.title.charAt(0)}`} 
                        alt={book.title}
                      />
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">{book.author}</p>
                      <span className={`status-badge ${book.status.toLowerCase().replace(" ", "-")}`}>
                        {book.status}
                      </span>
                    </div>
                    <button className="book-action-btn">
                      {book.status === "Available" ? "Reserve" : "Add to Wishlist"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="content-card">
              <div className="card-header">
                <h2>Browse Categories</h2>
              </div>
              <div className="categories-grid">
                {categories.map((category) => (
                  <div key={category.name} className="category-card">
                    <div className="category-icon">📚</div>
                    <h3>{category.name}</h3>
                    <p>{category.count} books</p>
                    <button className="category-btn">Explore</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-section">
            <div className="content-card">
              <h3>Quick Links</h3>
              <div className="quick-links">
                <a href="#" className="quick-link">📅 My Reservations</a>
                <a href="#" className="quick-link">📋 Reading History</a>
                <a href="#" className="quick-link">⭐ Favorites</a>
                <a href="#" className="quick-link">💬 Recommendations</a>
              </div>
            </div>

            <div className="content-card">
              <h3>Library Hours</h3>
              <div className="hours-info">
                <p><strong>Monday - Friday:</strong> 8AM - 8PM</p>
                <p><strong>Saturday:</strong> 9AM - 6PM</p>
                <p><strong>Sunday:</strong> 12PM - 5PM</p>
              </div>
            </div>

            <div className="content-card announcement">
              <h3>📢 Announcements</h3>
              <p>New STEM collection now available. Check it out in the Technology section!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;