import { useState, useEffect } from "react";
import AdminSidebar from "./components/AdminSidebar";
import "./styles/admin.css";

export default function AdminEmployers() {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      // Assuming backend runs on a standard port or is proxied. Adjust URL if necessary.
      const response = await fetch("http://localhost:5000/api/employers");
      if (!response.ok) {
        throw new Error("Failed to fetch employers");
      }
      const data = await response.json();
      setEmployers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/employers/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setEmployers(employers.filter((emp) => emp._id !== id));
        } else {
          alert("Failed to delete employer");
        }
      } catch (error) {
        console.error("Error deleting employer:", error);
        alert("Error deleting employer");
      }
    }
  };

  return (
    <div className="admin-main">
      <AdminSidebar />

      <div className="admin-content">
        <h2>Employers</h2>

        {loading ? (
          <p>Loading employers...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employers.length > 0 ? (
                employers.map((employer) => (
                  <tr key={employer._id}>
                    <td>{employer.firstName}</td>
                    <td>{employer.lastName}</td>
                    <td>{employer.companyName}</td>
                    <td>{employer.email}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(employer._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No employers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
