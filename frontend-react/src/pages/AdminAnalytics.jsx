import { useState, useEffect } from "react";
import { getAnalyticsData } from "../services/adminService";
import AdminLayout from "../components/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import "../styles/AdminAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getAnalyticsData(period);
      setAnalyticsData(data);
      setLoading(false);
    };
    fetchData();
  }, [period]);

  if (loading) {
    return <div className="analytics-loading">Loading analytics data...</div>;
  }

  if (!analyticsData) {
    return <div className="analytics-error">Failed to load analytics data</div>;
  }

  const reasonLabels = Object.keys(analyticsData.visitsByReason);
  const reasonData = Object.values(analyticsData.visitsByReason);

  const collegeLabels = Object.keys(analyticsData.visitsByCollege);
  const collegeData = Object.values(analyticsData.visitsByCollege);

  const dailyLabels = Object.keys(analyticsData.dailyVisits).sort();
  const dailyData = dailyLabels.map(date => analyticsData.dailyVisits[date]);

  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#fa709a",
    "#fee140"
  ];

  return (
    <AdminLayout title="📊 Library Analytics" subtitle="Detailed visitor statistics and insights">
      <div className="analytics-content">

      {/* Period Selector */}
      <div className="period-selector">
        <button
          className={`period-btn ${period === "week" ? "active" : ""}`}
          onClick={() => setPeriod("week")}
        >
          This Week
        </button>
        <button
          className={`period-btn ${period === "month" ? "active" : ""}`}
          onClick={() => setPeriod("month")}
        >
          This Month
        </button>
        <button
          className={`period-btn ${period === "year" ? "active" : ""}`}
          onClick={() => setPeriod("year")}
        >
          This Year
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Visits</h3>
          <div className="metric-value">{analyticsData.totalVisits}</div>
          <p className="metric-label">In {period}</p>
        </div>
        <div className="metric-card">
          <h3>Unique Reasons</h3>
          <div className="metric-value">{reasonLabels.length}</div>
          <p className="metric-label">Visit types</p>
        </div>
        <div className="metric-card">
          <h3>Colleges/Offices</h3>
          <div className="metric-value">{collegeLabels.length}</div>
          <p className="metric-label">Represented</p>
        </div>
        <div className="metric-card">
          <h3>Avg Daily Visits</h3>
          <div className="metric-value">
            {dailyLabels.length > 0
              ? Math.round(analyticsData.totalVisits / dailyLabels.length)
              : 0}
          </div>
          <p className="metric-label">Per day</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Daily Visits Line Chart */}
        <div className="chart-card">
          <h3>Daily Visits Trend</h3>
          <Line
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  label: "Visits",
                  data: dailyData,
                  borderColor: "#667eea",
                  backgroundColor: "rgba(102, 126, 234, 0.1)",
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true,
                  pointRadius: 4,
                  pointBackgroundColor: "#667eea",
                  pointBorderColor: "#fff"
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Visit Reasons Bar Chart */}
        <div className="chart-card">
          <h3>Visits by Reason</h3>
          <Bar
            data={{
              labels: reasonLabels,
              datasets: [
                {
                  label: "Number of Visits",
                  data: reasonData,
                  backgroundColor: colors.slice(0, reasonLabels.length),
                  borderRadius: 6,
                  borderSkipped: false
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Colleges Distribution Pie Chart */}
        <div className="chart-card">
          <h3>Visitors by College/Office</h3>
          <Pie
            data={{
              labels: collegeLabels,
              datasets: [
                {
                  label: "Number of Visitors",
                  data: collegeData,
                  backgroundColor: colors.slice(0, collegeLabels.length),
                  borderColor: "#fff",
                  borderWidth: 2
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "right" }
              }
            }}
          />
        </div>

        {/* Visit Reason Distribution Pie */}
        <div className="chart-card">
          <h3>Reason Distribution (%)</h3>
          <Pie
            data={{
              labels: reasonLabels,
              datasets: [
                {
                  label: "Percentage",
                  data: reasonData,
                  backgroundColor: colors.slice(0, reasonLabels.length),
                  borderColor: "#fff",
                  borderWidth: 2
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "right" }
              }
            }}
          />
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="details-section">
        <div className="detail-table">
          <h3>Visit Breakdown by Reason</h3>
          <table>
            <thead>
              <tr>
                <th>Reason</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reasonLabels.map((reason, idx) => (
                <tr key={idx}>
                  <td>{reason}</td>
                  <td>{reasonData[idx]}</td>
                  <td>
                    {((reasonData[idx] / analyticsData.totalVisits) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="detail-table">
          <h3>Visitors by College/Office</h3>
          <table>
            <thead>
              <tr>
                <th>College/Office</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {collegeLabels.map((college, idx) => (
                <tr key={idx}>
                  <td>{college || "Not Set"}</td>
                  <td>{collegeData[idx]}</td>
                  <td>
                    {((collegeData[idx] / analyticsData.totalVisits) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
