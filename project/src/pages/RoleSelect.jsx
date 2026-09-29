import { useNavigate } from "react-router-dom";
import "../styles/roleSelect.css";
import LandingIllustration from "../assets/landing-illustration.png";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      <div className="landing-container">
        <header className="landing-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/careerquest_logo.png" 
              alt="CareerQuest Logo" 
              style={{ width: '45px', height: '45px', borderRadius: '10px' }} 
            />
            <span className="landing-logo">CareerQuest</span>
          </div>
        </header>
        <main className="landing-main">
          <div className="illustration-wrapper">
            <img 
              src={LandingIllustration} 
              alt="People finding jobs" 
              className="landing-illustration" 
            />
          </div>

          <div className="landing-content">
            <h1 className="landing-heading" style={{ fontSize: '2.5rem' }}>
              Your next great <span className="highlight-blue">opportunity</span> awaits
            </h1>
            
            <div className="role-options-bottom">
              <button 
                className="btn-primary-large w-100" 
                onClick={() => navigate("/login")}
              >
                Start searching as Employee
              </button>
              <button 
                className="btn-outline-large w-100 mt-1" 
                onClick={() => navigate("/employer/login")}
              >
                Post jobs as Employer
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}