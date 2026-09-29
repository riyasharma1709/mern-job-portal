import { Link, useLocation } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h3 className="logo">CareerQuest</h3>

      <ul>
        <li className={location.pathname === "/dashboard" ? "active" : ""}>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        <li className={location.pathname === "/find-jobs" ? "active" : ""}>
          <Link to="/find-jobs">Find Jobs</Link>
        </li>

        <li className={location.pathname === "/jobs" ? "active" : ""}>
          <Link to="/jobs">My Jobs</Link>
        </li>

        <li className={location.pathname === "/applied-jobs" ? "active" : ""}>
          <Link to="/applied-jobs">Applied Jobs</Link>
        </li>

        <li className={location.pathname === "/saved-jobs" ? "active" : ""}>
          <Link to="/saved-jobs">Saved Jobs</Link>
        </li>

        <li className={location.pathname === "/suggested-jobs" ? "active" : ""}>
          <Link to="/suggested-jobs">
            <span style={{ marginRight: '8px' }}>✨</span>
            Suggested Jobs
          </Link>
        </li>
        <li className={location.pathname === "/profile" ? "active" : ""}>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </div>
  );
}
