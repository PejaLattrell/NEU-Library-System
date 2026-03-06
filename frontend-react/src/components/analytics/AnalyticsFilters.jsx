import { useMemo } from "react";

function AnalyticsFilters({
  preset,
  customRange,
  onPresetChange,
  onCustomRangeChange,
  onApplyCustomRange,
  onRefresh,
  loading
}) {
  const disableApply = useMemo(() => {
    return !customRange.startDate || !customRange.endDate || loading;
  }, [customRange.endDate, customRange.startDate, loading]);

  return (
    <div className="analytics-pro-filters">
      <div className="analytics-pro-filter-group">
        <label htmlFor="analytics-preset">Date Range</label>
        <select
          id="analytics-preset"
          value={preset}
          onChange={(event) => onPresetChange(event.target.value)}
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {preset === "custom" ? (
        <>
          <div className="analytics-pro-filter-group">
            <label htmlFor="analytics-start">Start Date</label>
            <input
              id="analytics-start"
              type="date"
              value={customRange.startDate}
              onChange={(event) => {
                onCustomRangeChange("startDate", event.target.value);
              }}
            />
          </div>

          <div className="analytics-pro-filter-group">
            <label htmlFor="analytics-end">End Date</label>
            <input
              id="analytics-end"
              type="date"
              value={customRange.endDate}
              onChange={(event) => {
                onCustomRangeChange("endDate", event.target.value);
              }}
            />
          </div>

          <button
            type="button"
            className="analytics-pro-btn"
            onClick={onApplyCustomRange}
            disabled={disableApply}
          >
            Apply Range
          </button>
        </>
      ) : null}

      <button
        type="button"
        className="analytics-pro-btn analytics-pro-btn-secondary"
        onClick={onRefresh}
        disabled={loading}
      >
        Refresh
      </button>
    </div>
  );
}

export default AnalyticsFilters;
