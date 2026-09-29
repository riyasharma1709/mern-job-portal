import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";
import "../styles/jobs.css";

export default function Jobs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) throw new Error("You must be logged in to view your jobs.");

      const response = await fetch("http://localhost:5000/api/applications/employee", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const token = localStorage.getItem("employeeToken");
      const response = await fetch(`http://localhost:5000/api/applications/employee/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const { application } = await response.json();
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, status: application.status } : app
      ));
    } catch (err) {
      console.error(err);
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="main">
        <Sidebar />
        <div className="content">
          <h2>My Job Tracker</h2>
          
          {loading ? (
            <div className="loading-state">Loading your jobs...</div>
          ) : error ? (
            <div className="loading-state" style={{ color: 'red' }}>Error: {error}</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <h3>You have no tracked jobs.</h3>
              <p>Apply to jobs to see them here.</p>
            </div>
          ) : (
            <div className="job-list">
              {applications.map((app) => (
                <JobCard 
                  key={app._id}
                  company={app.employerId?.companyName || "Unknown Company"} 
                  role={app.jobId?.title || "Unknown Role"} 
                  status={app.status} 
                  onStatusChange={(newStatus) => handleStatusChange(app._id, newStatus)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
