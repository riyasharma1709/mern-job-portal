import React, { useState } from "react";
import EmployerSidebar from "./EmployerSidebar";
import "./styles/EmployerAddJob.css";

export default function EmployerAddJob(){

const [jobData,setJobData]=useState({
  companyName:"",
  title:"",
  salary:"",
  description:"",
  photos:[],
  photoFiles:[],
  video:"",
  videoFile:null,
  location:"",
  skills:"",
  education:""
});

const [errors,setErrors]=useState({});

const handleChange=(e)=>{
  setJobData({
    ...jobData,
    [e.target.name]:e.target.value
  });
};

const handlePhotoUpload=(e)=>{
  const files=Array.from(e.target.files);
  const previewUrls=files.map((file)=>URL.createObjectURL(file));

  setJobData({
    ...jobData,
    photoFiles: files,
    photos: previewUrls
  });
};

const handleVideoUpload=(e)=>{
  const file=e.target.files[0];
  if(!file) return;

  if(file.size > 5*1024*1024){
    alert("Video must be less than 5MB");
    return;
  }

  const previewUrl=URL.createObjectURL(file);

  setJobData({
    ...jobData,
    videoFile: file,
    video: previewUrl
  });
};

const validate=()=>{
  let newErrors={};

  if(!jobData.companyName) newErrors.companyName="Company name required";
  if(!jobData.title) newErrors.title="Job title required";
  if(!jobData.location) newErrors.location="Location required";
  if(!jobData.salary) newErrors.salary="Salary required";
  if(!jobData.description) newErrors.description="Description required";
  if(!jobData.skills) newErrors.skills="Skills required";
  if(!jobData.education) newErrors.education="Education required";
  if(jobData.photos.length===0) newErrors.photos="Upload company photos";
  if(!jobData.video) newErrors.video="Upload company video";

  setErrors(newErrors);

  return Object.keys(newErrors).length===0;
};

const handleAddJob=async ()=>{
  if(!validate()) return;

  const formData = new FormData();
  formData.append("companyName", jobData.companyName);
  formData.append("title", jobData.title);
  formData.append("location", jobData.location);
  formData.append("salary", jobData.salary);
  formData.append("skills", jobData.skills);
  formData.append("education", jobData.education);
  formData.append("description", jobData.description);

  if (jobData.photoFiles && jobData.photoFiles.length > 0) {
    jobData.photoFiles.forEach(file => {
      formData.append("photos", file);
    });
  }

  if (jobData.videoFile) {
    formData.append("video", jobData.videoFile);
  }

  try {
    const token = localStorage.getItem("employerToken");
    if (!token) {
      alert("You must be logged in to post a job!");
      return;
    }

    const response = await fetch("http://localhost:5000/api/jobs", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    if (response.ok) {
      alert("Job Added Successfully");
      setJobData({
        companyName:"",
        title:"",
        location:"",
        salary:"",
        description:"",
        photos:[],
        photoFiles:[],
        video:"",
        videoFile:null,
        skills:"",
        education:""
      });
    } else {
      const errorData = await response.json();
      alert("Error adding job: " + (errorData.message || errorData.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error submitting job:", error);
    alert("Failed to submit job. Please check your backend connection.");
  }
};

return(
<div>
<EmployerSidebar/>
<div className="emp-content add-job-content">
<div className="add-job-header">
  <h2>Post a New Job</h2>
  <p>Fill out the details below to find the perfect candidate.</p>
</div>
<div className="add-job-wrapper">

<input
  name="companyName"
  placeholder="Company Name"
  value={jobData.companyName}
  onChange={handleChange}
/>
{errors.companyName && <p className="error">{errors.companyName}</p>}

<input
  name="title"
  placeholder="Job Title"
  value={jobData.title}
  onChange={handleChange}
/>
{errors.title && <p className="error">{errors.title}</p>}

<input
  name="location"
  placeholder="Location"
  value={jobData.location}
  onChange={handleChange}
/>
{errors.location && <p className="error">{errors.location}</p>}

<input
  name="salary"
  placeholder="Salary"
  value={jobData.salary}
  onChange={handleChange}
/>
{errors.salary && <p className="error">{errors.salary}</p>}

<input
  name="skills"
  placeholder="Skills (e.g. React, Node, MongoDB)"
  value={jobData.skills}
  onChange={handleChange}
/>
{errors.skills && <p className="error">{errors.skills}</p>}

<input
  name="education"
  placeholder="Education (e.g. BCA, B.Tech, MBA)"
  value={jobData.education}
  onChange={handleChange}
/>
{errors.education && <p className="error">{errors.education}</p>}

<textarea
  name="description"
  placeholder="Job Description"
  value={jobData.description}
  onChange={handleChange}
/>
{errors.description && <p className="error">{errors.description}</p>}

<label>Upload Company Photos</label>
<input
  type="file"
  multiple
  accept="image/*"
  onChange={handlePhotoUpload}
/>
{errors.photos && <p className="error">{errors.photos}</p>}

<div className="photo-preview">
{jobData.photos.map((img,i)=>(
  <img key={i} src={img} width="80" alt="preview"/>
))}
</div>

<label>Upload Company Video</label>
<input
  type="file"
  accept="video/*"
  onChange={handleVideoUpload}
/>
{errors.video && <p className="error">{errors.video}</p>}

{jobData.video && (
  <video width="250" controls>
    <source src={jobData.video}/>
  </video>
)}

<button onClick={handleAddJob}>
  Add Job
</button>

</div>
</div>
</div>
);
}