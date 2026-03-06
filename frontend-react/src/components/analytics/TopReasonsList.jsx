function TopReasonsList({ reasons = [] }) {
  return (
    <div className="analytics-pro-table-card">
      <h3>Top Engagement Reasons</h3>

      {reasons.length ? (
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {reasons.map((reason) => (
              <tr key={reason.reason}>
                <td>{reason.reason}</td>
                <td>{reason.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="analytics-pro-empty">No reason data found for this range.</p>
      )}
    </div>
  );
}

export default TopReasonsList;
