import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminProtectedRoute = () => {
  const isAdminAuth = localStorage.getItem("isAdminAuth");

  // If authorized, return an outlet that will render child elements
  // If not, return element that will navigate to login page
  return isAdminAuth === "true" ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default AdminProtectedRoute;
