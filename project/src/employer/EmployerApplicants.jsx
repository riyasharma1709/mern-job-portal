import { useState, useEffect } from "react";
import EmployerSidebar from "./EmployerSidebar";
import "./styles/employerApplicants.css";

export default function EmployerApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("all");

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      if (!token) {
        throw new Error("You must be logged in to view applicants.");
      }

      const response = await fetch("http://localhost:5000/api/applications/employer", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch applicants");
      }
      
      const data = await response.json();
      setApplicants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenResume = (app) => {
    setSelectedApp(app);
  };

  const closeProfileModal = () => {
    setSelectedApp(null);
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("employerToken");
      if (!token) return;
      
      const response = await fetch(`http://localhost:5000/api/applications/employee/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setApplicants(applicants.map(app => 
          app._id === appId ? { ...app, status: newStatus } : app
        ));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  // Derive unique jobs from applicants to build the filter dropdown
  const uniqueJobs = [];
  applicants.forEach(app => {
    if (app.jobId && !uniqueJobs.find(j => j._id === app.jobId._id)) {
      uniqueJobs.push(app.jobId);
    }
  });

  const filteredApplicants = selectedJobId === "all" 
      ? applicants 
      : applicants.filter(app => app.jobId && app.jobId._id === selectedJobId);

  return (
    <div>
      <EmployerSidebar />

      <div className="emp-content applicants-container">
        <div className="applicants-header">
          <h2>Applicant Tracker</h2>
          
          {uniqueJobs.length > 0 && (
            <select 
              className="job-filter"
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="all">🔍 All Jobs</option>
              {uniqueJobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "4rem", fontSize: "1.2rem", color: "#a0aec0" }}>
            <div className="loader" style={{ marginBottom: "15px" }}>⏳</div>
            Loading applicants...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", color: "#f87171", marginTop: "2rem", padding: "20px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px" }}>
            ⚠️ Error: {error}
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "4rem", color: "#a0aec0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📥</div>
            <h3>No applicants found yet</h3>
            <p>Wait for talented candidates to apply to your jobs.</p>
          </div>
        ) : (
          <div className="applicant-grid">
            {filteredApplicants.map((app) => {
              const name = app.employeeProfile?.name || app.employeeId?.name || "Unknown";
              const initial = name.charAt(0).toUpperCase();
              
              return (
                <div key={app._id} className="applicant-card">
                  
                  <div className="applicant-header">
                    <div className="applicant-avatar">
                      {app.employeeProfile?.profileImage ? (
                        <img src={`http://localhost:5000/${app.employeeProfile.profileImage}`} alt="Avatar" />
                      ) : (
                        <span>{initial}</span>
                      )}
                    </div>
                    <div className="applicant-info">
                      <h3>{name}</h3>
                      <p>{app.employeeId?.email}</p>
                    </div>
                  </div>

                  <div className="applicant-details">
                    <p><strong>Applying For:</strong> <span>{app.jobId?.title || 'Unknown Job'}</span></p>
                    <p><strong>Applied Date:</strong> <span>{new Date(app.createdAt).toLocaleDateString()}</span></p>
                  </div>

                  <div className="applicant-actions">
                    <select 
                      className={`status-badge status-${app.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                      style={{ cursor: 'pointer', appearance: 'auto', border: '1px solid #ccc', outline: 'none' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offer Received">Offer Received</option>
                      <option value="Hired">Hired</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button 
                      className="screen-btn"
                      onClick={() => handleScreenResume(app)}
                    >
                      Screen Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for viewing Resume / Profile */}
        {selectedApp && (
          <div className="modal-overlay">
            <div className="resume-modal">
              <button className="modal-close" onClick={closeProfileModal}>×</button>
              
              <div className="profile-header">
                <div className="applicant-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {selectedApp.employeeProfile?.profileImage ? (
                    <img src={`http://localhost:5000/${selectedApp.employeeProfile.profileImage}`} alt="Profile" />
                  ) : (
                    <span>{(selectedApp.employeeProfile?.name || selectedApp.employeeId?.name || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h3>{selectedApp.employeeProfile?.name || selectedApp.employeeId?.name || "Unknown Applicant"}</h3>
                  <span className={`status-badge status-${selectedApp.status.toLowerCase()}`}>
                    Current Status: {selectedApp.status}
                  </span>
                </div>
              </div>

              <div className="profile-details">
                <p><b>Email:</b> {selectedApp.employeeProfile?.email || selectedApp.employeeId?.email}</p>
                <p><b>Phone:</b> {selectedApp.employeeProfile?.phone || selectedApp.employeeId?.phone}</p>
                <p><b>Applied Job:</b> {selectedApp.jobId?.title}</p>
                <p><b>Date:</b> {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
                
                {selectedApp.employeeProfile ? (
                  <>
                    <p><b>Location:</b> {selectedApp.employeeProfile.location}</p>
                    <p><b>Qualifications:</b> {selectedApp.employeeProfile.qualification}</p>
                    <p><b>Skills:</b></p>
                    <div className="skills-tags">
                      {selectedApp.employeeProfile.skills && selectedApp.employeeProfile.skills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 165, 0, 0.1)', borderLeft: '4px solid orange', borderRadius: '4px' }}>
                    <p style={{ margin: 0, color: '#fbbf24' }}>This applicant has not completed their detailed profile yet.</p>
                  </div>
                )}

                {selectedApp.employeeProfile?.resume && (
                  <a 
                    href={`http://localhost:5000/${selectedApp.employeeProfile.resume}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="resume-btn"
                  >
                    📄 View & Download Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}