import { useNavigate } from "react-router-dom";
import "./styles/adminLogin.css";
import { useState } from "react";

export default function AdminLogin() {

  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {

    const correctAdminName = "Riyasharma";
    const correctAdminPassword = "riya@1709";

    if (adminName === correctAdminName && password === correctAdminPassword) {
      localStorage.setItem("isAdminAuth", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Admin Name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="admin-error">{error}</p>}

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
