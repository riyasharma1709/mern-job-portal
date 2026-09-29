import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useState } from "react";

export default function Login({ users }) {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 Validation Function
  const validate = () => {
    let newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/employees/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem("employeeToken", data.token);
        }
        setIsSubmitting(false);
        navigate("/dashboard");
      } else {
        setIsSubmitting(false);
        setErrors({ general: data.message || "Invalid email or password" });
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setIsSubmitting(false);
      setErrors({ general: "Server error. Please try again later." });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-left-content">
            Welcome Back! <br /> Find your dream job
          </div>
          <img src="/auth_login.png" alt="Login Graphic" className="auth-illustration" />
        </div>

        <div className="auth-right">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/careerquest_logo.png" alt="CareerQuest Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '10px' }} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>CareerQuest</h1>
          </div>
          <h2 style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginTop: '-5px' }}>Employee Login</h2>

          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
              />
              <label>Email</label>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
              />
              <label>Password</label>
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            {errors.general && <p className="error">{errors.general}</p>}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

          </form>

          <p className="auth-text">
            New user?
            <Link to="/register" className="auth-link"> Register</Link>
          </p>

        </div>
      </div>
    </div>
  );
}