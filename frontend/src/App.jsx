import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Unauthorized from "./pages/Unauthorized";
import { ThemeProvider } from "./context/ThemeContext";
import AdminRoute from "./components/Protect";

const App = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;