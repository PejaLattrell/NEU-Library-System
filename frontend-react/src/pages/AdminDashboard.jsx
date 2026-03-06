import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { getVisitorStats, blockUser, unblockUser, searchVisitors } from "../services/userService";
import Navbar from "../components/Navbar";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/");
          return;
        }

        const statsData = await getVisitorStats(filterPeriod);
        setStats(statsData);
        setVisitors(statsData.visitors || []);
        setFilteredVisitors(statsData.visitors || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPeriod, navigate]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = visitors.filter(
      (visitor) =>
        visitor.email.toLowerCase().includes(term.toLowerCase()) ||
        visitor.name.toLowerCase().includes(term.toLowerCase()) ||
        visitor.college.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredVisitors(filtered);
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      alert("User blocked successfully");
      const updated = visitors.map((v) =>
        v.id === userId ? { ...v, isBlocked: true } : v
      );
      setVisitors(updated);
      setFilteredVisitors(updated);
    } catch (error) {
      alert("Failed to block user");
      console.error(error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      alert("User unblocked successfully");
      const updated = visitors.map((v) =>
        v.id === userId ? { ...v, isBlocked: false } : v
      );
      setVisitors(updated);
      setFilteredVisitors(updated);
    } catch (error) {
      alert("Failed to unblock user");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <Navbar />

      <div className="admin-content">
        {/* Header */}
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Library Visitor Statistics & Management</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Visitors</h3>
              <div className="stat-value">{stats.totalVisitors}</div>
              <p className="stat-period">{filterPeriod}</p>
            </div>

            <div className="stat-card">
              <h3>Active Today</h3>
              <div className="stat-value">{stats.activeToday}</div>
              <p className="stat-period">Currently in library</p>
            </div>

            <div className="stat-card">
              <h3>Most Common Reason</h3>
              <div className="stat-value">{stats.mostCommonReason}</div>
              <p className="stat-period">{stats.mostCommonCount} visits</p>
            </div>

            <div className="stat-card">
              <h3>Blocked Users</h3>
              <div className="stat-value">{stats.blockedCount}</div>
              <p className="stat-period">Restricted access</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="controls-section">
          <div className="filter-group">
            <label>Filter by Period:</label>
            <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="search-group">
            <input
              type="text"
              placeholder="Search by name, email, or college..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Visitors Table */}
        <div className="visitors-section">
          <h2>Visitor List</h2>
          <div className="table-container">
            <table className="visitors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>College/Office</th>
                  <th>Visit Reason</th>
                  <th>Last Visit</th>
                  <th>Total Visits</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.length > 0 ? (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className={visitor.isBlocked ? "blocked-row" : ""}>
                      <td>{visitor.name}</td>
                      <td>{visitor.email}</td>
                      <td>{visitor.college}</td>
                      <td>
                        <span className="badge">{visitor.lastReason || "N/A"}</span>
                      </td>
                      <td>{new Date(visitor.lastVisit).toLocaleDateString()}</td>
                      <td>{visitor.totalVisits}</td>
                      <td>
                        <span className={`status ${visitor.isBlocked ? "blocked" : "active"}`}>
                          {visitor.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>
                      <td>
                        {visitor.isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(visitor.id)}
                            className="action-btn unblock-btn"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(visitor.id)}
                            className="action-btn block-btn"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No visitors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
