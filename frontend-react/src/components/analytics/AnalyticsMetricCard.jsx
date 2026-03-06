function AnalyticsMetricCard({ label, value, hint }) {
  return (
    <div className="analytics-pro-metric-card">
      <p className="analytics-pro-metric-label">{label}</p>
      <p className="analytics-pro-metric-value">{value}</p>
      {hint ? <p className="analytics-pro-metric-hint">{hint}</p> : null}
    </div>
  );
}

export default AnalyticsMetricCard;
