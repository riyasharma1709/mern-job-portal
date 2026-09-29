import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/findjob.css"; // Reuse styling

export default function AppliedJobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("employeeToken"); // Employee token
      if (!token) {
        throw new Error("You must be logged in to view applied jobs.");
      }

      const response = await fetch("http://localhost:5000/api/applications/employee", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
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
          <h2>Your Applied Jobs</h2>

          {loading ? (
            <div className="loading-state">Loading your applications...</div>
          ) : error ? (
            <div className="loading-state" style={{color: 'red'}}>Error: {error}</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h3>You haven't applied to any jobs yet.</h3>
              <p>Explore opportunities and take the next step!</p>
            </div>
          ) : (
            <div className="job-list">
              {applications.map((app) => (
                <div className="job-card" key={app._id}>
                  {/* Banner Image / Logo */}
                  {app.jobId && app.jobId.photos && app.jobId.photos.length > 0 ? (
                    <img 
                      src={`http://localhost:5000/${app.jobId.photos[0]}`} 
                      alt="Company" 
                      className="job-media"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="job-media fallback-media" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
                      {app.jobId?.title?.charAt(0) || "J"}
                    </div>
                  )}

                  <div className="job-card-content">
                    <h3>{app.jobId?.title || "Job Unavailable"}</h3>
                    
                    <div className="job-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        {app.employerId?.companyName || "Unknown Company"}
                      </span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {app.jobId?.location || 'Not Specified'}
                      </span>
                      <span className="meta-item status" style={{ fontWeight: 'bold', color: app.status === 'Pending' ? '#b48600' : (app.status === 'Rejected' ? 'red' : 'green'), marginLeft: 'auto' }}>
                        {app.status}
                      </span>
                    </div>

                    <p className="job-desc">Applied on: {new Date(app.createdAt).toLocaleDateString()}</p>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
