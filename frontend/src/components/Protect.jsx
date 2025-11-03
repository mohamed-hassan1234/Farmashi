import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const checkAuth = () => {
    try {
      const userStr = localStorage.getItem("user");
      const loginTimeStr = localStorage.getItem("loginTime");
      
      if (!userStr || !loginTimeStr) {
        return null;
      }

      const user = JSON.parse(userStr);
      const loginTime = new Date(loginTimeStr);
      const now = new Date();
      const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

      // Check if session is expired (24 hours)
      if (hoursDiff > 24) {
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
        return null;
      }

      return user;
    } catch (error) {
      // Clear corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
      return null;
    }
  };

  const user = checkAuth();

  // If no user or no role, redirect to login
  if (!user || !user.role) {
    return <Navigate to="/" replace />;
  }

  // If user is not admin, redirect to unauthorized
  if (user.role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // If everything is fine, render the children
  return children;
};

export default AdminRoute;