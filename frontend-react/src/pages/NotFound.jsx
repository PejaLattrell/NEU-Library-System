import { Link } from "react-router-dom";
import "../styles/SystemPages.css";

function NotFound() {
  return (
    <div className="system-page">
      <div className="system-page-card">
        <h1>404</h1>
        <p>The page you requested does not exist in the library portal.</p>
        <div className="system-page-actions">
          <Link to="/" className="system-page-link">Go to Login</Link>
          <Link to="/dashboard" className="system-page-link">Open Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
