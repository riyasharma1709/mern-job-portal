import React, { useState, useEffect } from "react";
import EmployerSidebar from "./EmployerSidebar";
import "./styles/EmployerJobs.css";

export default function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      if (!token) {
        throw new Error("Not logged in");
      }

      const response = await fetch("http://localhost:5000/api/jobs/employer", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

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
        const token = localStorage.getItem("employerToken");
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
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

  const handleEditClick = (job) => {
    setEditingJob({ ...job });
  };

  const handleEditChange = (e) => {
    setEditingJob({
      ...editingJob,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("companyName", editingJob.companyName || "");
    formData.append("title", editingJob.title || "");
    formData.append("location", editingJob.location || "");
    formData.append("salary", editingJob.salary || "");
    formData.append("skills", editingJob.skills || "");
    formData.append("education", editingJob.education || "");
    formData.append("description", editingJob.description || "");

    try {
      const token = localStorage.getItem("employerToken");
      const response = await fetch(`http://localhost:5000/api/jobs/${editingJob._id}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (response.ok) {
        alert("Job updated successfully");
        setEditingJob(null);
        fetchJobs(); // refresh the list to get updated data
      } else {
        const errorData = await response.json();
        alert("Failed to update job: " + (errorData.message || errorData.error || "Unknown"));
      }
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Error updating job");
    }
  };

  return (
    <div>
      <EmployerSidebar />

      <div className="emp-content">
        <h2>Manage Jobs</h2>

        <table>
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Title</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>Loading jobs...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", color: "red" }}>Error: {error}</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No Jobs Posted</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td>{job.companyName || "N/A"}</td>
                  <td>{job.title}</td>
                  <td>{job.location}</td>
                  <td>{job.salary}</td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(job)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {editingJob && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Job</h3>
              <input
                name="companyName"
                value={editingJob.companyName || ""}
                onChange={handleEditChange}
                placeholder="Company Name"
              />
              <input
                name="title"
                value={editingJob.title || ""}
                onChange={handleEditChange}
                placeholder="Job Title"
              />
              <input
                name="location"
                value={editingJob.location || ""}
                onChange={handleEditChange}
                placeholder="Location"
              />
              <input
                name="salary"
                value={editingJob.salary || ""}
                onChange={handleEditChange}
                placeholder="Salary"
              />
              <input
                name="skills"
                value={editingJob.skills || ""}
                onChange={handleEditChange}
                placeholder="Skills"
              />
              <input
                name="education"
                value={editingJob.education || ""}
                onChange={handleEditChange}
                placeholder="Education"
              />
              <textarea
                name="description"
                value={editingJob.description || ""}
                onChange={handleEditChange}
                placeholder="Job Description"
                rows="4"
              />
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setEditingJob(null)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleUpdate}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}