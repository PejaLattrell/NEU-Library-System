import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { getVisitorStats, blockUser, unblockUser } from "../services/userService";
import AdminLayout from "../components/AdminLayout";
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
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [blockingId, setBlockingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) { navigate("/"); return; }
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
        (visitor.email || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.name || "").toLowerCase().includes(term.toLowerCase()) ||
        (visitor.college || "").toLowerCase().includes(term.toLowerCase());
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

  const handleBlockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to block this user? They will not be able to access the library.")) return;
    setBlockingId(userId);
    try {
      await blockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: true } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: true });
    } catch (error) {
      alert("Failed to block user");
      console.error(error);
    }
    setBlockingId(null);
  };

  const handleUnblockUser = async (userId, e) => {
    if (e) e.stopPropagation();
    setBlockingId(userId);
    try {
      await unblockUser(userId);
      const updated = visitors.map((v) => v.id === userId ? { ...v, isBlocked: false } : v);
      setVisitors(updated);
      setFilteredVisitors(updated.filter((v) => {
        const matchesSearch = (v.email || "").toLowerCase().includes(searchTerm.toLowerCase()) || (v.name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBlock = blockedFilter === "all" || (blockedFilter === "blocked" && v.isBlocked) || (blockedFilter === "active" && !v.isBlocked);
        return matchesSearch && matchesBlock;
      }));
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, isBlocked: false });
    } catch (error) {
      alert("Failed to unblock user");
      console.error(error);
    }
    setBlockingId(null);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="ad-loading">
          <div className="ad-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Row */}
      {stats && (
        <div className="ad-stats-row">
          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-blue">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.totalVisitors}</span>
              <span className="ad-stat-lbl">Total Visitors</span>
            </div>
            <span className="ad-stat-period">{filterPeriod === "custom" ? "Custom" : filterPeriod}</span>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-purple">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val ad-stat-val-sm">{stats.mostCommonReason}</span>
              <span className="ad-stat-lbl">Top Reason ({stats.mostCommonCount})</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-red">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.blockedCount}</span>
              <span className="ad-stat-lbl">Blocked Users</span>
            </div>
          </div>

          <div className="ad-stat-card">
            <div className="ad-stat-icon ad-icon-green">
              <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/>
              </svg>
            </div>
            <div className="ad-stat-text">
              <span className="ad-stat-val">{stats.collegeBreakdown ? Object.keys(stats.collegeBreakdown).length : 0}</span>
              <span className="ad-stat-lbl">Colleges Represented</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="ad-filters-bar">
        <div className="ad-filters-left">
          <div className="ad-filter-item">
            <label>Period</label>
            <select
              value={filterPeriod}
              onChange={(e) => {
                setFilterPeriod(e.target.value);
                if (e.target.value === "custom") setShowCustomDatePicker(true);
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <div className="ad-filter-item">
            <label>Status</label>
            <select
              value={blockedFilter}
              onChange={(e) => {
                setBlockedFilter(e.target.value);
                filterVisitors(searchTerm, e.target.value);
              }}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        <div className="ad-search-wrap">
          <svg className="ad-search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or college..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomDatePicker && (
        <div className="ad-date-picker">
          <div className="ad-date-fields">
            <div className="ad-date-field">
              <label>Start Date</label>
              <input type="date" value={customDateRange.start} onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })} />
            </div>
            <div className="ad-date-field">
              <label>End Date</label>
              <input type="date" value={customDateRange.end} onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })} />
            </div>
          </div>
          <div className="ad-date-actions">
            <button className="ad-btn-primary" onClick={handleApplyCustomRange}>Apply</button>
            <button className="ad-btn-ghost" onClick={() => setShowCustomDatePicker(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="ad-table-card">
        <div className="ad-table-header">
          <h2>Users</h2>
          <span className="ad-table-count">{filteredVisitors.length} {filteredVisitors.length === 1 ? "user" : "users"}</span>
        </div>
        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>User</th>
                <th>College / Office</th>
                <th>Last Reason</th>
                <th>Last Visit</th>
                <th>Visits</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.length > 0 ? (
                filteredVisitors.map((visitor) => (
                  <tr
                    key={visitor.id}
                    className={visitor.isBlocked ? "row-blocked" : ""}
                    onClick={() => setSelectedUser(visitor)}
                  >
                    <td>
                      <div className="ad-user-cell">
                        <div className="ad-user-avatar">{(visitor.name || "?").charAt(0).toUpperCase()}</div>
                        <div className="ad-user-info">
                          <span className="ad-user-name">{visitor.name}</span>
                          <span className="ad-user-email">{visitor.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{visitor.college || "—"}</td>
                    <td><span className="ad-reason-badge">{visitor.lastReason || "N/A"}</span></td>
                    <td className="ad-td-muted">{visitor.lastVisit ? new Date(visitor.lastVisit).toLocaleDateString() : "—"}</td>
                    <td><span className="ad-visits-count">{visitor.totalVisits}</span></td>
                    <td>
                      <span className={`ad-status-badge ${visitor.isBlocked ? "ad-status-blocked" : "ad-status-active"}`}>
                        <span className="ad-status-dot"></span>
                        {visitor.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {visitor.isBlocked ? (
                        <button
                          onClick={(e) => handleUnblockUser(visitor.id, e)}
                          className="ad-action-btn ad-unblock-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Unblock"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleBlockUser(visitor.id, e)}
                          className="ad-action-btn ad-block-btn"
                          disabled={blockingId === visitor.id}
                        >
                          {blockingId === visitor.id ? "..." : "Block"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="ad-empty-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="36" height="36">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                    </svg>
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="ad-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ad-modal-close" onClick={() => setSelectedUser(null)}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Blocked Banner */}
            {selectedUser.isBlocked && (
              <div className="ad-modal-blocked-bar">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                </svg>
                <span>This user is blocked from accessing the library</span>
              </div>
            )}

            {/* Modal Header */}
            <div className="ad-modal-head">
              <div className="ad-modal-avatar">{(selectedUser.name || "?").charAt(0).toUpperCase()}</div>
              <div>
                <h2 className="ad-modal-name">{selectedUser.name}</h2>
                <p className="ad-modal-email">{selectedUser.email}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="ad-modal-info-grid">
              <div className="ad-modal-info">
                <span className="ad-info-label">College / Office</span>
                <span className="ad-info-value">{selectedUser.college || "Not set"}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Total Visits</span>
                <span className="ad-info-value">{selectedUser.totalVisits}</span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Status</span>
                <span className={`ad-info-value ${selectedUser.isBlocked ? "val-blocked" : "val-active"}`}>
                  {selectedUser.isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
              <div className="ad-modal-info">
                <span className="ad-info-label">Last Visit</span>
                <span className="ad-info-value">{selectedUser.lastVisit ? new Date(selectedUser.lastVisit).toLocaleString() : "N/A"}</span>
              </div>
            </div>

            {/* Block/Unblock Action */}
            <div className="ad-modal-action-bar">
              {selectedUser.isBlocked ? (
                <button className="ad-modal-action-btn ad-modal-unblock" onClick={(e) => handleUnblockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Unblock User"}
                </button>
              ) : (
                <button className="ad-modal-action-btn ad-modal-block" onClick={(e) => handleBlockUser(selectedUser.id, e)} disabled={blockingId === selectedUser.id}>
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                  </svg>
                  {blockingId === selectedUser.id ? "Processing..." : "Block User"}
                </button>
              )}
            </div>

            {/* Visit History */}
            <div className="ad-modal-visits">
              <h3>Visit History</h3>
              {selectedUser.visits && selectedUser.visits.length > 0 ? (
                <div className="ad-visits-list">
                  {selectedUser.visits.slice().reverse().slice(0, 10).map((visit, idx) => (
                    <div key={idx} className="ad-visit-row">
                      <span className="ad-visit-reason">{visit.reason}</span>
                      <span className="ad-visit-time">{new Date(visit.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="ad-no-visits">No visit history available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDashboard;
