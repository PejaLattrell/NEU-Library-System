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
  const [selectedUser, setSelectedUser] = useState(null);
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [blockedFilter, setBlockedFilter] = useState("all"); // all, active, blocked

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
    filterVisitors(term, blockedFilter);
  };

  const filterVisitors = (term, blocked) => {
    let filtered = visitors.filter((visitor) => {
      const matchesSearch =
        visitor.email.toLowerCase().includes(term.toLowerCase()) ||
        visitor.name.toLowerCase().includes(term.toLowerCase()) ||
        visitor.college.toLowerCase().includes(term.toLowerCase());

      const matchesBlock =
        blocked === "all" ||
        (blocked === "blocked" && visitor.isBlocked) ||
        (blocked === "active" && !visitor.isBlocked);

      return matchesSearch && matchesBlock;
    });

    setFilteredVisitors(filtered);
  };

  const handleApplyCustomRange = async () => {
    if (!customDateRange.start || !customDateRange.end) {
      alert("Please select both start and end dates");
      return;
    }
    setShowCustomDatePicker(false);
    const statsData = await getVisitorStats("custom", customDateRange.start, customDateRange.end);
    setStats(statsData);
    setVisitors(statsData.visitors || []);
    setFilteredVisitors(statsData.visitors || []);
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      const updated = visitors.map((v) =>
        v.id === userId ? { ...v, isBlocked: true } : v
      );
      setVisitors(updated);
      filterVisitors(searchTerm, blockedFilter);
      alert("User blocked successfully");
    } catch (error) {
      alert("Failed to block user");
      console.error(error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      const updated = visitors.map((v) =>
        v.id === userId ? { ...v, isBlocked: false } : v
      );
      setVisitors(updated);
      filterVisitors(searchTerm, blockedFilter);
      alert("User unblocked successfully");
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
              <p className="stat-period">{filterPeriod === "custom" ? "Custom Range" : filterPeriod}</p>
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

            <div className="stat-card college-breakdown">
              <h3>By College/Office</h3>
              <div className="college-list">
                {stats.collegeBreakdown && Object.entries(stats.collegeBreakdown).length > 0 ? (
                  Object.entries(stats.collegeBreakdown).slice(0, 3).map(([college, count]) => (
                    <div key={college} className="college-item">
                      <span>{college}</span>
                      <span className="count">{count}</span>
                    </div>
                  ))
                ) : (
                  <p>No data available</p>
                )}
                {stats.collegeBreakdown && Object.keys(stats.collegeBreakdown).length > 3 && (
                  <p className="more-colleges">+{Object.keys(stats.collegeBreakdown).length - 3} more</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="controls-section">
          <div className="filter-group">
            <label>Filter by Period:</label>
            <select 
              value={filterPeriod} 
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                if (e.target.value === "custom") {
                  setShowCustomDatePicker(true);
                }
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="filter-group">
            <label>User Status:</label>
            <select 
              value={blockedFilter} 
              onChange={(e) => {
                setBlockedFilter(e.target.value);
                filterVisitors(searchTerm, e.target.value);
              }}
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>
          </div>

          {showCustomDatePicker && (
            <div className="custom-date-picker">
              <div className="date-inputs">
                <div className="date-field">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  />
                </div>
                <div className="date-field">
                  <label>End Date:</label>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  />
                </div>
              </div>
              <div className="date-actions">
                <button onClick={handleApplyCustomRange} className="apply-btn">Apply</button>
                <button onClick={() => setShowCustomDatePicker(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          )}

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
                    <tr 
                      key={visitor.id} 
                      className={visitor.isBlocked ? "blocked-row" : ""}
                      onClick={() => setSelectedUser(visitor)}
                      style={{ cursor: "pointer" }}
                    >
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
                      <td onClick={(e) => e.stopPropagation()}>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>✕</button>
            
            {/* Blocked Warning Banner */}
            {selectedUser.isBlocked && (
              <div className="blocked-banner">
                <span className="banned-icon">🚫</span>
                <span className="banned-text">This user has been BLOCKED and cannot access the library</span>
              </div>
            )}
            
            <div className="modal-header">
              <h2>Visit History</h2>
              <p className="modal-subtitle">{selectedUser.name} ({selectedUser.email})</p>
            </div>

            <div className="modal-body">
              <div className="user-info-grid">
                <div className="info-item">
                  <label>College/Office:</label>
                  <span>{selectedUser.college}</span>
                </div>
                <div className="info-item">
                  <label>Total Visits:</label>
                  <span>{selectedUser.totalVisits}</span>
                </div>
                <div className="info-item">
                  <label>Status:</label>
                  <span className={selectedUser.isBlocked ? "blocked" : "active"}>
                    {selectedUser.isBlocked ? "🚫 BLOCKED" : "✅ Active"}
                  </span>
                </div>
                <div className="info-item">
                  <label>Last Visit:</label>
                  <span>{selectedUser.lastVisit ? new Date(selectedUser.lastVisit).toLocaleString() : "N/A"}</span>
                </div>
              </div>

              <div className="visit-history">
                <h3>Recent Visits</h3>
                {selectedUser.visits && selectedUser.visits.length > 0 ? (
                  <div className="visits-list">
                    {selectedUser.visits.slice().reverse().map((visit, idx) => (
                      <div key={idx} className="visit-item">
                        <span className="visit-reason">{visit.reason}</span>
                        <span className="visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-visits">No visit history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
