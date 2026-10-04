import React, { useState } from "react";
import "../styles/auth.css";
import { Link, useNavigate } from "react-router-dom";

export default function EmployerRegister() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.firstName) newErrors.firstName = "Required";
    if (!formData.lastName) newErrors.lastName = "Required";
    if (!formData.companyName) newErrors.companyName = "Required";

    if (!formData.email) {
      newErrors.email = "Required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.password) {
      newErrors.password = "Required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Min 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch("https://mern-job-portal-backend.vercel.app/api/employers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Registered Successfully ✅");
      navigate("/employer/login");

    } catch (error) {
      alert("Server Error ❌");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <div className="auth-left">
            <div className="auth-left-content">
                Join our Platform!<br /> Find the perfect candidate
            </div>
            <img src="/employer.png" alt="Employer Graphic" className="auth-illustration" />
        </div>

        <div className="auth-right">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/careerquest_logo.png" alt="CareerQuest Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '10px' }} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>CareerQuest</h1>
            <p style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem', margin: 0 }}>FOR EMPLOYERS</p>
          </div>
          <form onSubmit={handleSubmit}>
            <h2 style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginTop: '5px', marginBottom: '20px' }}>Employer Register</h2>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input name="firstName" placeholder=" " onChange={handleChange} />
                <label>First Name</label>
                {errors.firstName && <p className="error">{errors.firstName}</p>}
            </div>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input name="lastName" placeholder=" " onChange={handleChange} />
                <label>Last Name</label>
                {errors.lastName && <p className="error">{errors.lastName}</p>}
            </div>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input name="companyName" placeholder=" " onChange={handleChange} />
                <label>Company Name</label>
                {errors.companyName && <p className="error">{errors.companyName}</p>}
            </div>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input name="email" placeholder=" " onChange={handleChange} />
                <label>Email</label>
                {errors.email && <p className="error">{errors.email}</p>}
            </div>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input type="password" name="password" placeholder=" " onChange={handleChange} />
                <label>Password</label>
                {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <div className="input-group" style={{marginBottom: "18px"}}>
                <input type="password" name="confirmPassword" placeholder=" " onChange={handleChange} />
                <label>Confirm Password</label>
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" style={{marginTop: "5px"}}>Register</button>

            <p className="auth-text">
              Already have account? <Link to="/employer/login" className="auth-link">Login</Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}