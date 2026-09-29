import EmployerSidebar from "./EmployerSidebar";
import "./styles/employerDashboard.css";
import { useEffect, useState } from "react";

export default function EmployerDashboard() {
  const [employer, setEmployer] = useState(null);
  const [jobCount, setJobCount] = useState(0);
  const [applicantCount, setApplicantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      const info = localStorage.getItem("employerInfo");
      const token = localStorage.getItem("employerToken");
      if (info) {
        setEmployer(JSON.parse(info));
      }

      if (token) {
        try {
          const headers = { Authorization: `Bearer ${token}` };
          const [jobsRes, appsRes] = await Promise.all([
            fetch("http://localhost:5000/api/jobs/employer", { headers }),
            fetch("http://localhost:5000/api/applications/employer", { headers })
          ]);

          if (jobsRes.ok) {
            const jobsData = await jobsRes.json();
            setJobCount(jobsData.length);
          }
          if (appsRes.ok) {
            const appsData = await appsRes.json();
            setApplicantCount(appsData.length);
          }
        } catch (error) {
          console.error("Error fetching dashboard counts:", error);
        }
      }
      setLoading(false);
    };

    initDashboard();
  }, []);

  return (
    <div>
      <EmployerSidebar />
      <div className="emp-content">
        
        {/* Simple crisp header matching light theme */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: '#1e293b', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Welcome back, {employer ? `${employer.firstName || ''} ${employer.lastName || ''}`.trim() : 'Employer'}!
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem' }}>
            Manage {employer && employer.companyName ? employer.companyName : 'your company'} job postings and applicants efficiently.
          </p>
        </div>

        <h2 style={{ marginBottom: '20px', color: '#334155', fontWeight: '700', fontSize: '1.4rem' }}>Overview</h2>
        
        {loading ? (
          <div style={{ color: '#64748b', fontSize: '1rem' }}>Loading statistics...</div>
        ) : (
          <div className="emp-cards">
            
            {/* Total Jobs Card */}
            <div className="emp-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.95rem', margin: 0, color: '#64748b', fontWeight: '600' }}>Jobs Posted</p>
                <div style={{ background: 'rgba(129, 140, 248, 0.15)', padding: '8px', borderRadius: '10px', fontSize: '1.2rem' }}>💼</div>
              </div>
              <h2 style={{ fontSize: '2.5rem', margin: '0', color: '#10b981' }}>
                {jobCount}
              </h2>
            </div>
            
            {/* Total Applicants Card */}
            <div className="emp-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontSize: '0.95rem', margin: 0, color: '#64748b', fontWeight: '600' }}>Applicants</p>
                <div style={{ background: 'rgba(52, 211, 153, 0.15)', padding: '8px', borderRadius: '10px', fontSize: '1.2rem' }}>👥</div>
              </div>
              <h2 style={{ fontSize: '2.5rem', margin: '0', color: '#10b981' }}>
                {applicantCount}
              </h2>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}