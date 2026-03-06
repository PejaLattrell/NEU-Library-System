import { Line } from "react-chartjs-2";

function EngagementTrendsChart({ data = [] }) {
  return (
    <div className="analytics-pro-chart-card">
      <h3>Engagement Trends</h3>
      <Line
        data={{
          labels: data.map((entry) => entry.date),
          datasets: [
            {
              label: "Visits",
              data: data.map((entry) => entry.visits),
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              pointRadius: 3,
              tension: 0.35,
              fill: true
            },
            {
              label: "Checkouts",
              data: data.map((entry) => entry.checkouts),
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.1)",
              pointRadius: 3,
              tension: 0.35,
              fill: true
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }}
      />
    </div>
  );
}

export default EngagementTrendsChart;
