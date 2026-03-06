import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import AdminLayout from "../components/AdminLayout";
import AnalyticsFilters from "../components/analytics/AnalyticsFilters";
import AnalyticsMetricCard from "../components/analytics/AnalyticsMetricCard";
import PeakVisitHoursChart from "../components/analytics/PeakVisitHoursChart";
import PopularBooksChart from "../components/analytics/PopularBooksChart";
import EngagementTrendsChart from "../components/analytics/EngagementTrendsChart";
import TopReasonsList from "../components/analytics/TopReasonsList";
import { getAdvancedAnalytics } from "../services/adminService";
import "../styles/AdminAnalytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const toDateInput = (date) => date.toISOString().slice(0, 10);

const buildDefaultRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);

  return {
    startDate: toDateInput(startDate),
    endDate: toDateInput(endDate)
  };
};

function AdminAnalytics() {
  const [preset, setPreset] = useState("last30days");
  const [customRange, setCustomRange] = useState(buildDefaultRange);
  const [queryParams, setQueryParams] = useState({ preset: "last30days" });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAdvancedAnalytics(queryParams);
        setAnalyticsData(data);
      } catch (fetchError) {
        setError(fetchError?.message || "Failed to fetch analytics.");
      }

      setLoading(false);
    };

    fetchData();
  }, [queryParams]);

  const summary = analyticsData?.summary || {
    totalVisits: 0,
    totalCheckouts: 0,
    averageDailyVisits: 0,
    averageDailyCheckouts: 0,
    peakHour: "00:00",
    peakHourVisits: 0
  };

  const rangeLabel = useMemo(() => {
    if (!analyticsData?.range) {
      return "";
    }

    const start = new Date(analyticsData.range.startDate).toLocaleDateString();
    const end = new Date(analyticsData.range.endDate).toLocaleDateString();
    return `${start} - ${end}`;
  }, [analyticsData]);

  const handlePresetChange = (nextPreset) => {
    setPreset(nextPreset);

    if (nextPreset !== "custom") {
      setQueryParams({ preset: nextPreset });
    }
  };

  const handleCustomRangeChange = (field, value) => {
    setCustomRange((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleApplyCustomRange = () => {
    if (!customRange.startDate || !customRange.endDate) {
      setError("Select a valid custom date range first.");
      return;
    }

    if (new Date(customRange.startDate) > new Date(customRange.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    setQueryParams({
      preset: "custom",
      startDate: customRange.startDate,
      endDate: customRange.endDate
    });
  };

  const handleRefresh = () => {
    setQueryParams((previous) => ({ ...previous, refreshedAt: Date.now() }));
  };

  return (
    <AdminLayout>
      <div className="analytics-pro-container">
        <div className="analytics-pro-header">
          <div>
            <h1>Library System Pro Analytics</h1>
            <p>Track peak hours, popular books, and engagement trends in real time.</p>
          </div>
          {rangeLabel ? <span className="analytics-pro-range">{rangeLabel}</span> : null}
        </div>

        <AnalyticsFilters
          preset={preset}
          customRange={customRange}
          onPresetChange={handlePresetChange}
          onCustomRangeChange={handleCustomRangeChange}
          onApplyCustomRange={handleApplyCustomRange}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {error ? <div className="analytics-pro-error">{error}</div> : null}

        <div className="analytics-pro-metrics-grid">
          <AnalyticsMetricCard
            label="Total Visits"
            value={summary.totalVisits}
            hint="All visits in selected range"
          />
          <AnalyticsMetricCard
            label="Total Checkouts"
            value={summary.totalCheckouts}
            hint="Checkout frequency"
          />
          <AnalyticsMetricCard
            label="Avg Daily Visits"
            value={summary.averageDailyVisits}
            hint="Visits per day"
          />
          <AnalyticsMetricCard
            label="Peak Hour"
            value={summary.peakHour}
            hint={`${summary.peakHourVisits} visits`}
          />
        </div>

        {loading && !analyticsData ? (
          <div className="analytics-pro-loading">Loading advanced analytics...</div>
        ) : (
          <>
            <div className="analytics-pro-grid">
              <PeakVisitHoursChart data={analyticsData?.peakVisitHours || []} />
              <PopularBooksChart data={analyticsData?.popularBooks || []} />
              <EngagementTrendsChart data={analyticsData?.engagementTrends || []} />
            </div>

            <TopReasonsList reasons={analyticsData?.topReasons || []} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminAnalytics;
