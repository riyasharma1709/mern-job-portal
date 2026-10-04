import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { useState } from "react";

export default function Register({ users, setUsers }) {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Validation Function
  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("https://mern-job-portal-backend.vercel.app/api/employees/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep(2);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setErrors((prev) => ({ ...prev, general: data.message || "Failed to send OTP" }));
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, general: "Server error. Please try again later." }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/employees/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          otp: otp
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registered User:", data.employee);
        if (data.token) {
          localStorage.setItem("employeeToken", data.token);
        }
        if (typeof setUsers === "function" && typeof users !== "undefined") {
          setUsers([...users, data.employee]);
        }
        setIsSubmitting(false);
        navigate("/");

      } else {
        setIsSubmitting(false);
        setErrors((prev) => ({ ...prev, general: data.message || "Registration failed" }));
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, general: "Server error. Please try again later." }));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-left-content">
            Join Us! <br /> Track your jobs easily
          </div>
          <img src="/auth_register.png" alt="Register Graphic" className="auth-illustration" />
        </div>

        <div className="auth-right">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src="/careerquest_logo.png" alt="CareerQuest Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '10px' }} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>CareerQuest</h1>
          </div>
          <h2 style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginTop: '-5px' }}>Employee Registration</h2>

          {step === 1 ? (
          <form onSubmit={handleSendOTP}>

            {/* Name */}
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
              />
              <label>Full Name</label>
              {errors.name && <p className="error">{errors.name}</p>}
            </div>

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

            {/* Phone */}
            <div className="input-group">
              <input
                type="text"
                name="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
              />
              <label>Phone Number</label>
              {errors.phone && <p className="error">{errors.phone}</p>}
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

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder=" "
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <label>Confirm Password</label>
              {errors.confirmPassword && (
                <p className="error">{errors.confirmPassword}</p>
              )}
            </div>

            {errors.general && (
              <p className="error" style={{ marginBottom: "15px", textAlign: "center" }}>
                {errors.general}
              </p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>
          ) : (
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                name="otp"
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <label>Enter 6-digit OTP</label>
              {errors.otp && <p className="error">{errors.otp}</p>}
            </div>

            {errors.general && (
              <p className="error" style={{ marginBottom: "15px", textAlign: "center" }}>
                {errors.general}
              </p>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Verify and Register"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
              style={{ marginTop: "10px", backgroundColor: "transparent", color: "white", border: "1px solid white" }}
            >
              Back
            </button>
          </form>
          )}

          <p className="auth-text">
            Already have an account?
            <Link to="/" className="auth-link"> Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}