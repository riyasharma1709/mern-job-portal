import React, { useState, useEffect } from "react";
import EmployerSidebar from "./EmployerSidebar";
import "./styles/employerProfile.css";

export default function EmployerProfile() {

  const [profile, setProfile] = useState({
    companyName: "",
    location: "",
    website: "",
    industry: "",
    description: "",
    logo: "",
    photos: [],
    video: ""
  });

  const [files, setFiles] = useState({
    logo: null,
    photos: [],
    video: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("employerToken");
      const employerInfo = JSON.parse(localStorage.getItem("employerInfo"));

      if (!token || !employerInfo) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/employer-profile/employer/${employerInfo._id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({
          companyName: data.companyName || "",
          location: data.location || "",
          website: data.website || "",
          industry: data.industry || "",
          description: data.description || "",
          logo: data.logo || "",
          photos: data.photos || [],
          video: data.video || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Logo must be an image");
      return;
    }
    setFiles({ ...files, logo: file });
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setProfile({ ...profile, logo: reader.result });
    reader.readAsDataURL(file);
  };

  const handlePhotos = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 3) {
      alert("Maximum 3 photos allowed");
      return;
    }
    setFiles({ ...files, photos: newFiles });
    
    // Preview
    const readers = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        readers.push(reader.result);
        if (readers.length === newFiles.length) {
          setProfile({ ...profile, photos: readers });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      alert("Upload valid video");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("Video must be under 10MB");
      return;
    }
    setFiles({ ...files, video: file });

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setProfile({ ...profile, video: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!profile.companyName || !profile.location) {
      alert("Company Name and Location required");
      return;
    }

    const token = localStorage.getItem("employerToken");
    if (!token) return alert("Not logged in");

    const formData = new FormData();
    formData.append("companyName", profile.companyName);
    formData.append("location", profile.location);
    formData.append("website", profile.website);
    formData.append("industry", profile.industry);
    formData.append("description", profile.description);

    if (files.logo) formData.append("logo", files.logo);
    if (files.video) formData.append("video", files.video);
    if (files.photos && files.photos.length > 0) {
      files.photos.forEach(file => formData.append("photos", file));
    }

    try {
      const response = await fetch("http://localhost:5000/api/employer-profile", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        alert("Profile Saved Successfully!");
        fetchProfile(); // Refresh
      } else {
        const errorData = await response.json();
        alert("Error saving profile: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Check backend connection.");
    }
  };

  // Helper to render previews cleanly regardless if base64 or backend path
  const getPreviewSrc = (src) => {
    if (!src) return null;
    if (src.startsWith('data:')) return src; // Base64
    if (src.startsWith('http')) return src; // Full URL
    return `http://localhost:5000/${src}`; // Backend Path
  };

  return (
    <div>
      <EmployerSidebar />
      <div className="emp-content">
        <h2>Company Profile</h2>
        
        {loading ? (
          <div>Loading profile...</div>
        ) : (
          <div className="profile-form">
            <label>Company Name *</label>
            <input name="companyName" placeholder="Company Name" value={profile.companyName} onChange={handleChange} />

            <label>Location *</label>
            <input name="location" placeholder="Location" value={profile.location} onChange={handleChange} />

            <label>Website</label>
            <input name="website" placeholder="Website" value={profile.website} onChange={handleChange} />

            <label>Industry</label>
            <input name="industry" placeholder="Industry" value={profile.industry} onChange={handleChange} />

            <label>Company Description</label>
            <textarea name="description" placeholder="Company Description" value={profile.description} onChange={handleChange} />

            <label>Company Logo</label>
            <input type="file" onChange={handleLogo} accept="image/*" />
            {profile.logo && <img src={getPreviewSrc(profile.logo)} alt="Logo" style={{width: '60px', borderRadius: '8px', marginTop: '5px'}} />}

            <label>Office Photos (Max 3)</label>
            <input type="file" multiple onChange={handlePhotos} accept="image/*" />
            <div style={{display: 'flex', gap: '10px', marginTop: '5px'}}>
              {profile.photos.map((photo, i) => (
                <img key={i} src={getPreviewSrc(photo)} alt={`Office ${i}`} style={{width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
              ))}
            </div>

            <label>Company Video (Max 10MB)</label>
            <input type="file" onChange={handleVideo} accept="video/*" />
            {profile.video && <video src={getPreviewSrc(profile.video)} controls style={{width: '200px', borderRadius: '8px', marginTop: '5px'}} />}

            <button onClick={handleSave}>Save Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}