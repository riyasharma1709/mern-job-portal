import AdminSidebar from "./components/AdminSidebar";
import "./styles/admin.css";

export default function AdminDashboard() {
  return (
    <div className="admin-main">
      <AdminSidebar />

      <div className="admin-content">
        <h2>Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Jobs</h3>
            <p>25</p>
          </div>

          <div className="stat-card">
            <h3>Total Users</h3>
            <p>120</p>
          </div>

          <div className="stat-card">
            <h3>Applications</h3>
            <p>320</p>
          </div>
        </div>
      </div>
    </div>
  );
}
