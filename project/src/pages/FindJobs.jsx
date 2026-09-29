import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/findjob.css";

export default function FindJobs() {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search states
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  // Modal State
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [jobForApply, setJobForApply] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) return;
      
      const response = await fetch("http://localhost:5000/api/employees/saved-jobs/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Since getSavedJobs returns populated jobs, extract IDs
        setSavedJobs(data.map(job => job._id));
      }
    } catch (err) {
      console.error("Failed to fetch saved jobs", err);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        alert("Please login to save jobs.");
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/employees/save-job/${jobId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (response.ok) {
        if (savedJobs.includes(jobId)) {
          setSavedJobs(savedJobs.filter(id => id !== jobId));
        } else {
          setSavedJobs([...savedJobs, jobId]);
        }
      }
    } catch (err) {
      console.error("Error saving job", err);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs based on search inputs
  const filteredJobs = jobs.filter(job => {
    const matchRole = job.title?.toLowerCase().includes(searchRole.toLowerCase()) || 
                      job.skills?.toLowerCase().includes(searchRole.toLowerCase());
    const matchLocation = job.location?.toLowerCase().includes(searchLocation.toLowerCase());
    return matchRole && matchLocation;
  });

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem("employeeToken"); // Using employeeToken
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
        setIsCompanyModalOpen(false); // Close modal if applying from inside
      } else {
        alert(data.message || "Failed to apply");
      }
    } catch (err) {
      alert("Error applying to job");
    }
  };

  const handleSeeCompanyDetails = async (job) => {
    setJobForApply(job);
    setIsCompanyModalOpen(true);
    setModalLoading(true);

    try {
      const resp = await fetch(`http://localhost:5000/api/employer-profile/employer/${job.employerId}`);
      if (resp.ok) {
        const data = await resp.json();
        setSelectedCompany(data);
      } else {
        setSelectedCompany(null);
      }
    } catch (err) {
      console.error(err);
      setSelectedCompany(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsCompanyModalOpen(false);
    setSelectedCompany(null);
    setJobForApply(null);
  };

  return (
    <>
      <Navbar />

      <div className="main">
        <Sidebar />

        <div className="content">
          <h2>Find Your Dream Job</h2>

          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search by role or skills (e.g. React, Node)..." 
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Location..." 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-state">Loading amazing opportunities...</div>
          ) : error ? (
            <div className="loading-state" style={{color: 'red'}}>Error: {error}</div>
          ) : filteredJobs.length === 0 ? (
            <div className="empty-state">
              <h3>No jobs found matching your search.</h3>
              <p>Try adjusting your search criteria!</p>
            </div>
          ) : (
            <div className="job-list">
              <div className="section-heading">Promoted jobs</div>
              {filteredJobs.slice(0, 1).map((job) => (
                <div className="job-card promoted" key={job._id}>
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
                        {job.video && <video src={`http://localhost:5000/${job.video}`} className="job-video-small" controls />}
                        <button onClick={() => handleSeeCompanyDetails(job)} className="icon-button-details">
                          See Company Details
                        </button>
                        <button onClick={() => handleSaveJob(job._id)} className="icon-button-save" style={{ background: 'transparent', color: savedJobs.includes(job._id) ? '#2563eb' : '#4b5563', border: savedJobs.includes(job._id) ? '1px solid #2563eb' : '1px solid #d1d5db', marginLeft: '10px', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '1.2rem', marginRight: '4px', verticalAlign: 'middle' }}>{savedJobs.includes(job._id) ? "♥" : "♡"}</span> 
                          <span style={{ verticalAlign: 'middle' }}>{savedJobs.includes(job._id) ? "Saved" : "Save"}</span>
                        </button>
                        <button onClick={() => handleApply(job)} className="icon-button-apply" style={{ marginLeft: '10px' }}>
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="section-heading">Because you are interested in this</div>
              {filteredJobs.slice(1).map((job) => (
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
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {job.location || 'Not Specified'}
                      </span>
                      {job.education && (
                        <span className="meta-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                          {job.education}
                        </span>
                      )}
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
                        {job.video && <video src={`http://localhost:5000/${job.video}`} className="job-video-small" controls />}
                        <button onClick={() => handleSeeCompanyDetails(job)} className="icon-button-details">
                          See Company Details
                        </button>
                        <button onClick={() => handleSaveJob(job._id)} className="icon-button-save" style={{ background: 'transparent', color: savedJobs.includes(job._id) ? '#2563eb' : '#4b5563', border: savedJobs.includes(job._id) ? '1px solid #2563eb' : '1px solid #d1d5db', marginLeft: '10px', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                          <span style={{ fontSize: '1.2rem', marginRight: '4px', verticalAlign: 'middle' }}>{savedJobs.includes(job._id) ? "♥" : "♡"}</span> 
                          <span style={{ verticalAlign: 'middle' }}>{savedJobs.includes(job._id) ? "Saved" : "Save"}</span>
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

      {isCompanyModalOpen && (
        <div className="company-modal-overlay" onClick={closeModal}>
          <div className="company-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            {modalLoading ? (
              <p>Loading company details...</p>
            ) : selectedCompany ? (
              <div className="company-info-wrapper">
                {selectedCompany.logo && (
                  <img src={`http://localhost:5000/${selectedCompany.logo}`} alt="Company Logo" className="company-modal-logo" />
                )}
                <h2>{selectedCompany.companyName}</h2>
                <div className="company-meta">
                  {selectedCompany.industry && <span>🏢 {selectedCompany.industry}</span>}
                  {selectedCompany.location && <span>📍 {selectedCompany.location}</span>}
                  {selectedCompany.website && <span>🌐 <a href={selectedCompany.website} target="_blank" rel="noreferrer">{selectedCompany.website}</a></span>}
                </div>
                <div className="company-description">
                  <h3>About Us</h3>
                  <p>{selectedCompany.description || "No description provided."}</p>
                </div>

                {selectedCompany.photos && selectedCompany.photos.length > 0 && (
                  <div className="company-photos">
                    <h3>Office Gallery</h3>
                    <div className="photo-grid">
                      {selectedCompany.photos.map((photo, i) => (
                        <img key={i} src={`http://localhost:5000/${photo}`} alt={`Office ${i}`} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedCompany.video && (
                  <div className="company-video-wrapper">
                    <h3>Company Video</h3>
                    <video src={`http://localhost:5000/${selectedCompany.video}`} controls />
                  </div>
                )}

                <div className="modal-actions">
                   <button className="modal-apply-btn" onClick={() => handleApply(jobForApply)}>
                     Apply Now for {jobForApply?.title}
                   </button>
                </div>
              </div>
            ) : (
              <div className="company-no-data">
                <h2>No Detailed Profile</h2>
                <p>This employer has not fully set up their company profile yet.</p>
                <div className="modal-actions" style={{marginTop: '20px'}}>
                   <button className="modal-apply-btn" onClick={() => handleApply(jobForApply)}>
                     Apply Now for {jobForApply?.title} anyway
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
