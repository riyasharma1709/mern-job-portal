import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/findjob.css";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        throw new Error("You must be logged in to view saved jobs.");
      }
      
      const response = await fetch("http://localhost:5000/api/employees/saved-jobs/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        throw new Error("Failed to fetch saved jobs");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) return;
      
      const response = await fetch(`http://localhost:5000/api/employees/save-job/${jobId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Remove from list
        setJobs(jobs.filter(job => job._id !== jobId));
      }
    } catch (err) {
      console.error("Error unsaving job", err);
    }
  };

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        alert("Please login to apply.");
        return;
      }
      
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job._id,
          employerId: job.employerId
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Successfully applied to ${job.title}!`);
      } else {
        alert(data.message || "Failed to apply");
      }
    } catch (err) {
      alert("Error applying to job");
    }
  };

  return (
    <>
      <Navbar />

      <div className="main">
        <Sidebar />

        <div className="content">
          <h2>Your Saved Jobs</h2>

          {loading ? (
            <div className="loading-state">Loading your saved opportunities...</div>
          ) : error ? (
            <div className="loading-state" style={{color: 'red'}}>Error: {error}</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No saved jobs.</h3>
              <p>Explore Find Jobs to save the ones you are interested in!</p>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-card" key={job._id}>
                  {job.photos && job.photos.length > 0 ? (
                    <img src={`http://localhost:5000/${job.photos[0]}`} alt="Company" className="job-media" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="job-media fallback-media">{job.title.charAt(0)}</div>
                  )}

                  <div className="job-card-content">
                    <h3>{job.title}</h3>
                    <p className="job-desc">{job.description}</p>
                    
                    <div className="job-meta">
                      {job.education && (
                        <span className="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                          {job.education}
                        </span>
                      )}
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {job.location || 'Not Specified'}
                      </span>
                      <span className="meta-item salary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line><line x1="12" y1="14" x2="12" y2="10"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="10" x2="8" y2="10"></line></svg>
                        {job.salary ? (job.salary.includes('₹') || job.salary.includes('Rs') ? job.salary : `₹${job.salary}`) : 'Not Disclosed'}
                      </span>
                    </div>

                    <div className="job-bottom-row">
                      {job.skills && (
                        <div className="job-skills">
                          {job.skills.split(',').map((skill, index) => (
                            <span key={index} className="skill-pill">{skill.trim()}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="apply-section">
                        <button onClick={() => handleUnsaveJob(job._id)} className="icon-button-save" style={{ background: 'transparent', color: '#2563eb', border: '1px solid #2563eb', marginLeft: '10px', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '1.2rem', marginRight: '4px', verticalAlign: 'middle' }}>♥</span>
                          <span style={{ verticalAlign: 'middle' }}>Saved</span>
                        </button>
                        <button onClick={() => handleApply(job)} className="icon-button-apply" style={{ marginLeft: '10px' }}>
                          Apply
                        </button>
                      </div>
                    </div>
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
