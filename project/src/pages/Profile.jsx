import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/profile.css";

export default function Profile() {

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    location: "",
    qualification: "",
    skills: ""
  });

  const [errors, setErrors] = useState({});
  const [profileId, setProfileId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [resume, setResume] = useState(null);
  const [resumeName, setResumeName] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    loadLoggedUserAndProfile();
  }, []);

  const loadLoggedUserAndProfile = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("employeeToken");

    if (!token) {
      alert("Please login first.");
      setIsLoading(false);
      return;
    }

    try {
      // Fetch authenticated employee details
      const empRes = await axios.get("http://localhost:5000/api/employees/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const email = empRes.data.email;

      // Try fetching profile using the secured email
      try {
        const res = await axios.get(`http://localhost:5000/api/profiles/email/${email}`);
        const data = res.data;

        setProfileId(data._id);
        setFormData({
          email: data.email || email,
          name: data.name || "",
          phone: data.phone || "",
          location: data.location || "",
          qualification: data.qualification || "",
          skills: data.skills ? data.skills.join(", ") : ""
        });

        if (data.profileImage) {
          setProfileImage(`http://localhost:5000/${data.profileImage}`);
        }
        
        if (data.resume) {
          setResumeName(data.resume);
        }

        setIsEditing(false); // Display mode
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Profile does not exist, pre-fill from user details and go into edit mode
          setFormData({
            email: email,
            name: empRes.data.name || "",
            phone: empRes.data.phone || "",
            location: "",
            qualification: "",
            skills: ""
          });
          setIsEditing(true);
        } else {
          console.error("Error fetching profile details", err);
        }
      }
    } catch (err) {
      console.error("Error verifying current user", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
      setProfileImageFile(file);
    }
  };

  // Handle Resume Upload
  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResume(file);
    }
  };

  // 🔥 Validation
  const validate = () => {
    let newErrors = {};

    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit Indian number";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }

    if (!formData.skills.trim()) {
      newErrors.skills = "Skills are required";
    } else {
      const skillsArray = formData.skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

      if (skillsArray.length !== 5) {
        newErrors.skills = "Exactly 5 skills are required (comma separated)";
      }
    }

    if (!profileId && !profileImage && !profileImageFile) {
      newErrors.profileImage = "Profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBuildResumeWithAI = async () => {
    if (!formData.name || !formData.qualification || !formData.skills) {
      alert("Please fill out Name, Qualification, and Skills before generating a resume with AI.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const res = await axios.post("http://localhost:5000/api/profiles/generate-resume", formData);
      alert(res.data.message || "AI Resume Generated! Opening in a new tab...");
      
      // Open the generated PDF in a new tab instantly without overwriting the local DB resume
      if (res.data.fileUrl) {
        window.open(`http://localhost:5000/${res.data.fileUrl}`, '_blank');
      }
    } catch(err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to generate AI resume. Please ensure you have configured Gemini API Key in the backend.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (validate()) {
      setIsSaving(true);
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("email", formData.email);
        formDataToSend.append("name", formData.name);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("location", formData.location);
        formDataToSend.append("qualification", formData.qualification);
        formDataToSend.append("skills", formData.skills);
        
        if (profileImageFile) {
          formDataToSend.append("profileImage", profileImageFile);
        }
        if (resume) {
          formDataToSend.append("resume", resume);
        }

        if (profileId) {
          // UPDATE (PUT by ID)
          await axios.put(`http://localhost:5000/api/profiles/${profileId}`, formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          alert("Profile Updated Successfully ✅");
        } else {
          // CREATE (POST)
          await axios.post("http://localhost:5000/api/profiles", formDataToSend, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          alert("Profile Created Successfully ✅");
        }
        
        // Reload all data cleanly and switch to display mode
        await loadLoggedUserAndProfile();
        
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to save profile.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="main">
        <Sidebar />

        <div className="content">
          <div className="profile-card">
            
            {isLoading ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                <div style={{ fontSize: "2rem", marginBottom: "15px" }}>⏳</div>
                <h3>Loading Profile...</h3>
              </div>
            ) : !isEditing ? (
              // ===================== DISPLAY MODE =====================
              <div className="profile-view">
                <div className="profile-header">
                  <img 
                    src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt="Profile" 
                    className="profile-photo" 
                    style={{ border: '4px solid var(--primary)' }}
                  />
                  <div className="profile-info">
                    <h3>{formData.name}</h3>
                    <p>📧 {formData.email}</p>
                    <p>📱 {formData.phone}</p>
                    <p>📍 {formData.location}</p>
                  </div>
                </div>

                <div className="profile-details-grid">
                  <div className="detail-item">
                    <strong>Qualification</strong>
                    <span>{formData.qualification}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Resume</strong>
                    {resumeName ? (
                      <a href={`http://localhost:5000/${resumeName}`} target="_blank" rel="noreferrer" className="resume-download">
                        📄 View Resume
                      </a>
                    ) : (
                      <span>No resume uploaded</span>
                    )}
                    <button 
                      onClick={handleBuildResumeWithAI} 
                      disabled={isGeneratingAI}
                      style={{ marginTop: '10px', display: 'block', padding: '8px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                      {isGeneratingAI ? "✨ Generating..." : "✨ Build Resume with AI"}
                    </button>
                  </div>
                </div>

                <div className="detail-item" style={{ marginTop: '10px' }}>
                  <strong>Skills</strong>
                  <div className="skills-tags">
                    {formData.skills.split(",").map((s, i) => 
                      s.trim() !== "" ? <span key={i} className="skill-tag">{s.trim()}</span> : null
                    )}
                  </div>
                </div>

                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Edit Profile
                </button>
              </div>
            ) : (
              // ===================== EDIT MODE =====================
              <>
                <h2 style={{ marginBottom: "20px" }}>{profileId ? "Edit Profile" : "Create Profile"}</h2>
                <form onSubmit={handleSave}>

                  {/* Profile Photo */}
                  <div className="profile-photo-section">
                    <div className="photo-wrapper">
                      <img
                        src={
                          profileImage
                            ? profileImage
                            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt="Profile"
                        className="profile-photo"
                      />
                      <label htmlFor="photoUpload" className="upload-overlay">
                        📷
                      </label>
                      <input
                        type="file"
                        id="photoUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </div>
                  </div>
                  {errors.profileImage && <p className="error" style={{ textAlign: 'center' }}>{errors.profileImage}</p>}

                  {/* Email (Readonly since it is fetched securely) */}
                  <div className="profile-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      style={{ opacity: 0.7, cursor: "not-allowed" }}
                    />
                    <small>Your login email cannot be changed.</small>
                  </div>

                  {/* Name */}
                  <div className="profile-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <p className="error">{errors.name}</p>}
                  </div>

                  {/* Phone */}
                  <div className="profile-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <p className="error">{errors.phone}</p>}
                  </div>

                  {/* Location */}
                  <div className="profile-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai, India"
                    />
                    {errors.location && <p className="error">{errors.location}</p>}
                  </div>

                  {/* Qualification */}
                  <div className="profile-group">
                    <label>Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech in Computer Science"
                    />
                    {errors.qualification && <p className="error">{errors.qualification}</p>}
                  </div>

                  {/* Skills */}
                  <div className="profile-group">
                    <label>Skills (Enter exactly 5 skills separated by comma)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Express, MongoDB, JavaScript"
                    />
                    {errors.skills && <p className="error">{errors.skills}</p>}
                  </div>

                  {/* Resume */}
                  <div className="profile-group">
                    <label>Upload Resume (PDF, DOC)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      style={{ background: 'transparent', padding: '10px 0', border: 'none' }}
                    />
                    {resume && <small style={{ display: 'block' }}>New file selected: {resume.name}</small>}
                    {resumeName && !resume && <small style={{ display: 'block', color: 'var(--primary)' }}>Existing file: {resumeName}</small>}
                    {errors.resume && <p className="error">{errors.resume}</p>}
                    <button 
                      type="button"
                      onClick={handleBuildResumeWithAI} 
                      disabled={isGeneratingAI}
                      style={{ marginTop: '10px', display: 'inline-block', padding: '8px 12px', background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                    >
                      {isGeneratingAI ? "✨ Generating..." : "✨ Build Resume with AI"}
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    {profileId && (
                      <button type="button" className="save-btn" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="save-btn" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>

                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}