import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import "../styles/auth.css";

export default function EmployerLogin() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const handleLogin = async () => {

        let valid = true;

        // reset errors
        setEmailError("");
        setPasswordError("");

        // Email validation
        if (email === "") {
            setEmailError("Email is required");
            valid = false;
        } else {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                setEmailError("Enter valid email");
                valid = false;
            }
        }

        // Password validation
        if (password === "") {
            setPasswordError("Password is required");
            valid = false;
        } else if (password.length > 3 && false) { // Assuming we remove the length > 3 constraint for legit passwords, or it was meant to be < 3
            // just keeping simple validation, skip the confusing length > 3
        }

        if (valid) {
            try {
                const response = await fetch("http://localhost:5000/api/employers/login", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("employerToken", data.token);
                    localStorage.setItem("employerInfo", JSON.stringify(data.employer));
                    navigate("/employer/dashboard");
                } else {
                    setPasswordError(data.message || "Login failed");
                }
            } catch (err) {
                setPasswordError("Server error. Please try again later.");
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-left-content">
                        Welcome, Employer!<br /> Post Jobs & Hire Talent
                    </div>
                    <img src="/employer.png" alt="Employer Graphic" className="auth-illustration" />
                </div>
                <div className="auth-right">
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img src="/careerquest_logo.png" alt="CareerQuest Logo" style={{ width: '60px', height: '60px', borderRadius: '12px', marginBottom: '10px' }} />
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1e293b' }}>CareerQuest</h1>
                        <p style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem', margin: 0 }}>FOR EMPLOYERS</p>
                    </div>
                    <h2 style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginTop: '5px' }}>Employer Login</h2>
                    
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder=" "
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                        />
                        <label>Email</label>
                        {emailError && <p className="error">{emailError}</p>}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder=" "
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        <label>Password</label>
                        {passwordError && <p className="error">{passwordError}</p>}
                    </div>

                    <button onClick={handleLogin}>
                        Login
                    </button>

                    <p className="auth-text">
                        Create Account?{" "}
                        <Link to="/employer/register" className="auth-link">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}