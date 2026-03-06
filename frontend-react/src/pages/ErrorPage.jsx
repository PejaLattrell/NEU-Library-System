import { Link } from "react-router-dom";
import "../styles/SystemPages.css";

function ErrorPage({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this page."
}) {
  return (
    <div className="system-page">
      <div className="system-page-card">
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="system-page-actions">
          <Link to="/" className="system-page-link">Go to Login</Link>
          <button onClick={() => window.location.reload()} type="button">
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
