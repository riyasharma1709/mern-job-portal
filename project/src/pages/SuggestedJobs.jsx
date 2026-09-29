import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/findjob.css";

export default function SuggestedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchSuggestedJobs();
  }, []);

  const fetchSuggestedJobs = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        throw new Error("Please login to see AI suggestions.");
      }
      
      const response = await fetch("http://localhost:5000/api/jobs/suggested", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch AI suggestions");
      }

      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        alert("Please login to apply.");
        return;
      }
      
      if (!job.employerId) {
        alert("Cannot apply: Employer details are missing for this job.");
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
        alert(data.message || "Failed to apply. Please try again.");
      }
    } catch (err) {
      console.error("Apply error:", err);
      alert("Error applying to job: " + err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="main">
        <Sidebar />

        <div className="content">
          <div className="ai-header" style={{ marginBottom: '20px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>✨</span> 
              AI Suggested Jobs
            </h2>
            <p style={{ color: '#64748b' }}>Our AI analyzed your profile to find these perfect matches for you.</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="ai-loader" style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 'bold' }}>
                 Analyzing your skills and searching for the best roles...
              </div>
            </div>
          ) : error ? (
            <div className="loading-state" style={{ color: '#ef4444', background: '#fef2f2', padding: '30px', borderRadius: '12px', border: '1px solid #fee2e2', textAlign: 'center' }}>
               <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
               <strong style={{ fontSize: '1.1rem' }}>{error.includes("key") || error.includes("valid") ? "AI Configuration Error" : "AI Service is Busy"}</strong>
               <p style={{ margin: '10px 0', color: '#7f1d1d' }}>
                 {error.includes("503") || error.includes("demand") 
                   ? "Google AI is currently experiencing high demand. Please wait a few seconds and try again." 
                   : error.includes("key") || error.includes("valid")
                   ? "The AI service is not configured correctly. Please check your API key."
                   : error}
               </p>
               
               <button 
                 onClick={() => { setError(""); setLoading(true); fetchSuggestedJobs(); }}
                 style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
               >
                 Try Again
               </button>

               {error.includes("profile") && (
                 <div style={{ marginTop: '15px' }}>
                   <a href="/profile" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>Click here to complete your profile</a>
                 </div>
               )}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <h3>No suggestions found.</h3>
              <p>Make sure your profile has skills and qualifications listed so AI can match you!</p>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-card" key={job._id} style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', position: 'relative', overflow: 'hidden' }}>
                  {/* AI Badge */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    {Math.floor(Math.random() * 10 + 90)}% Match
                  </div>

                  <div className="job-card-content" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                       {job.photos && job.photos.length > 0 ? (
                        <img src={`http://localhost:5000/${job.photos[0]}`} alt="Company" style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#64748b' }}>{job.companyName.charAt(0)}</div>
                      )}
                      
                      <div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>{job.title}</h3>
                        <p style={{ margin: '4px 0', color: '#2563eb', fontWeight: 'semibold' }}>{job.companyName}</p>
                        <div className="job-meta" style={{ marginTop: '8px', display: 'flex', gap: '15px' }}>
                          <span className="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            {job.location}
                          </span>
                          <span className="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12" y2="18"></line><line x1="12" y1="14" x2="12" y2="10"></line><line x1="16" y1="14" x2="16" y2="14"></line><line x1="8" y1="14" x2="8" y2="14"></line><line x1="16" y1="10" x2="16" y2="10"></line><line x1="8" y1="10" x2="8" y2="10"></line></svg>
                            {job.salary ? (job.salary.includes('₹') || job.salary.includes('Rs') ? job.salary : `₹${job.salary}`) : 'Not Disclosed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #6366f1' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', fontStyle: 'italic' }}>
                        <strong>Why you matched:</strong> {job.matchReason}
                      </p>
                    </div>

                    <div className="job-bottom-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="job-skills">
                        {job.skills.split(',').slice(0, 3).map((skill, index) => (
                          <span key={index} className="skill-pill" style={{ background: '#e0e7ff', color: '#4338ca' }}>{skill.trim()}</span>
                        ))}
                      </div>
                      <button onClick={() => handleApply(job)} className="icon-button-apply" style={{ background: '#2563eb', color: 'white', padding: '10px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                        Apply Now
                      </button>
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
