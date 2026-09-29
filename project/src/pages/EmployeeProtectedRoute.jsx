import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EmployeeProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/employees/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("employeeInfo", JSON.stringify(data));
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeInfo");
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []);

  if (isAuthenticated === null) return <div style={{textAlign: 'center', marginTop: '20vh'}}>Loading secure access...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
