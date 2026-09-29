import { Link, useNavigate } from "react-router-dom";
import "../styles/adminSidebar.css";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    navigate("/admin/login");
  };

  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>

      <Link to="/admin/dashboard">Dashboard</Link>
      <Link to="/admin/jobs">Manage Jobs</Link>
      <Link to="/admin/employer">Employers</Link>
      <Link to="/admin/users">Users</Link>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
