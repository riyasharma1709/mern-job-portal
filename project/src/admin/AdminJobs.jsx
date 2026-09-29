import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import "./styles/admin.css";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setJobs(jobs.filter((job) => job._id !== id));
        } else {
          alert("Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Error deleting job");
      }
    }
  };

  return (
    <div className="admin-main">
      <AdminSidebar />

      <div className="admin-content">
        <h2>Manage Jobs</h2>

        {loading ? (
          <p>Loading jobs...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.companyName || "N/A"}</td>
                    <td>{job.title}</td>
                    <td>{job.location}</td>
                    <td>{job.salary}</td>
                    <td>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
