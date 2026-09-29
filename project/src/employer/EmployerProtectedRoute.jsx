import { Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";

const EmployerProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("employerToken");
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            try {
                const res = await fetch("http://localhost:5000/api/employers/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem("employerInfo", JSON.stringify(data));
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("employerToken");
                    localStorage.removeItem("employerInfo");
                    setIsAuthenticated(false);
                }
            } catch (err) {
                setIsAuthenticated(false);
            }
        };
        verifyToken();
    }, []);

    if (isAuthenticated === null) return <div style={{textAlign: 'center', marginTop: '20vh'}}>Loading secure access...</div>;
    return isAuthenticated ? <Outlet /> : <Navigate to="/employer/login" replace />;
};

export default EmployerProtectedRoute;
