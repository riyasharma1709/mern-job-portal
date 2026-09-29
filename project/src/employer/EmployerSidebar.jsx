import { Link, useNavigate } from "react-router-dom";
import "./styles/employerSidebar.css";

export default function EmployerSidebar() {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("employerToken");
    localStorage.removeItem("employerInfo");
    navigate("/employer/login");
  };
  return (
    <div className="emp-sidebar">

      <h2 className="emp-logo">CareerQuest</h2>
      <p style={{ color: 'var(--primary-main)', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', marginTop: '-10px', marginBottom: '20px' }}>FOR EMPLOYERS</p>

      <ul>

        <li>
          <Link to="/employer/dashboard">Dashboard</Link>
        </li>

        <li>
          <Link to="/employer/add-job">Add Job</Link>
        </li>

        <li>
          <Link to="/employer/jobs">My Jobs</Link>
        </li>

        <li>
          <Link to="/employer/applicants">Applicants</Link>
        </li>

        <li>
          <Link to="/employer/profile">Profile</Link>
        </li>

        <li>
          <a href="#" onClick={handleLogout} style={{color: 'var(--text-main)', textDecoration: 'none'}}>Logout</a>
        </li>

      </ul>

    </div>
  );
}