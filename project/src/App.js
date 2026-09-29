import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";

import Profile from "./pages/Profile";
import FindJobs from "./pages/FindJobs";
import AppliedJobs from "./pages/AppliedJobs";
import SavedJobs from "./pages/SavedJobs";
import SuggestedJobs from "./pages/SuggestedJobs";
import EmployeeProtectedRoute from "./pages/EmployeeProtectedRoute";

import "./styles/global.css";

//---------------------------------------admin----------------------------------------------------------
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminJobs from "./admin/AdminJobs";
import AdminAddJob from "./admin/AdminAddJob";
import AdminUsers from "./admin/AdminUsers";
import AdminEmployers from "./admin/AdminEmployers";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import RoleSelect from "./pages/RoleSelect";

//----------------------------------------employer---------------------------------------------------------
import EmployerLogin from "./employer/EmployerLogin";
import EmployerDashboard from "./employer/EmployerDashboard";
import EmployerAddJob from "./employer/EmployerAddJob";
import EmployerApplicants from "./employer/EmployerApplicants";
import EmployerProfile from "./employer/EmployerProfile";
import EmployerRegister from "./employer/EmployerRegister";
import EmployerJobs from "./employer/EmployerJobs";
import EmployerProtectedRoute from "./employer/EmployerProtectedRoute";

function App() {

  const [users, setUsers] = useState([]);
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/" element={<Login users={users} />} /> */}
        <Route path="/" element={<RoleSelect />} />
        <Route path="/login" element={<Login users={users} />} />
        <Route path="/register" element={<Register users={users} setUsers={setUsers} />} />
        <Route element={<EmployeeProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/saved-jobs" element={<SavedJobs />} />
          <Route path="/suggested-jobs" element={<SuggestedJobs />} />
          <Route path="/applied-jobs" element={<AppliedJobs />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* ---------------------------admin-------------------------------- */}

        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/add-job" element={<AdminAddJob />} />
          <Route path="/admin/employer" element={<AdminEmployers />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>

        {/*----------------------------emloyer--------------------------------- */}
        <Route path="/employer/login" element={<EmployerLogin />} />
        <Route path="/employer/register" element={<EmployerRegister />} />

        <Route element={<EmployerProtectedRoute />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/add-job" element={<EmployerAddJob />} />
          <Route path="/employer/jobs" element={<EmployerJobs />} />
          <Route path="/employer/applicants" element={<EmployerApplicants />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
