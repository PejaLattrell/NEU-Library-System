import { Bar } from "react-chartjs-2";

function PeakVisitHoursChart({ data = [] }) {
  return (
    <div className="analytics-pro-chart-card">
      <h3>Peak Visit Hours</h3>
      <Bar
        data={{
          labels: data.map((entry) => entry.hour),
          datasets: [
            {
              label: "Visits",
              data: data.map((entry) => entry.visits),
              backgroundColor: "rgba(59, 130, 246, 0.75)",
              borderRadius: 8
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false }
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

export default PeakVisitHoursChart;
