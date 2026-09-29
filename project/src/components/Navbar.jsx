import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/layout.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");

  useEffect(() => {
    const infoStr = localStorage.getItem("employeeInfo");
    if (infoStr) {
      try {
        const info = JSON.parse(infoStr);
        if (info && info.name) {
          setEmployeeName(info.name);
        }
      } catch (e) {
        console.error("Failed to parse employee info");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("employeeToken");
    localStorage.removeItem("employeeInfo");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img 
          src="/careerquest_logo.png" 
          alt="CareerQuest Logo" 
          style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} 
        />
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          CareerQuest
        </h3>
      </div>
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {employeeName && (
          <div className="user-greeting" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: '500' }}>
            <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: 'var(--primary-main)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {employeeName.charAt(0).toUpperCase()}
            </div>
            <span>{employeeName}</span>
          </div>
        )}
        <button 
          className="logout-btn" 
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 16px',
            borderRadius: 'var(--radius-full)', fontWeight: '600', transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
