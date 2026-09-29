import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState({
    applied: 0,
    interviewing: 0,
    offered: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const info = localStorage.getItem("employeeInfo");
    if (info) {
      setEmployee(JSON.parse(info));
    }
    fetchApplicationStats();
  }, []);

  const fetchApplicationStats = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/applications/employee", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        const applications = await response.json();
        const applied = applications.length;
        const interviewing = applications.filter(app => app.status === 'Interviewing').length;
        const offered = applications.filter(app => app.status === 'Offer Received' || app.status === 'Accepted').length;
        const rejected = applications.filter(app => app.status === 'Rejected' || app.status === 'Not Selected by Employer').length;

        setStats({ applied, interviewing, offered, rejected });
      }
    } catch (err) {
      console.error("Failed to fetch applications for stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="main">
        <Sidebar />
        <div className="content">
          <div style={{ background: 'var(--glass-bg)', border: 'var(--glass-border)', backdropFilter: 'var(--glass-blur)', borderRadius: '15px', padding: '40px', color: 'var(--text-main)', marginBottom: '30px', boxShadow: 'var(--shadow-sm)' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', fontWeight: 'bold' }}>
              Welcome back, {employee ? employee.name : 'Employee'}! 👋
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1.2rem' }}>
              Your future starts here. Keep applying and tracking your progress.
            </p>
          </div>
          
          <h2 className="dashboard-title">Your Statistics</h2>
          {loading ? (
             <div style={{color: 'var(--text-muted)'}}>Loading your stats...</div>
          ) : (
            <div className="stats">
              <StatsCard title="Applied" count={stats.applied} />
              <StatsCard title="Interviewing" count={stats.interviewing} />
              <StatsCard title="Offered" count={stats.offered} />
              <StatsCard title="Not Selected" count={stats.rejected} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
