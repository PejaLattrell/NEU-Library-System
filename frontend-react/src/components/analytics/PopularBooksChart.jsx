import { Bar } from "react-chartjs-2";

function PopularBooksChart({ data = [] }) {
  const labels = data.map((book) => book.title);
  const counts = data.map((book) => book.checkouts);

  return (
    <div className="analytics-pro-chart-card">
      <h3>Most Popular Books</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Checkouts",
              data: counts,
              backgroundColor: "rgba(16, 185, 129, 0.75)",
              borderRadius: 8
            }
          ]
        }}
        options={{
          indexAxis: "y",
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: { precision: 0 }
            }
          }
        }}
      />
    </div>
  );
}

export default PopularBooksChart;
