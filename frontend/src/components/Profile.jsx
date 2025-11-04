import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = "";
axios.defaults.withCredentials = true;

const Profile = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: ""
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [deleteForm, setDeleteForm] = useState({
    password: ""
  });

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get("/api/users/profile");
      setUser(data);
      setProfileForm({
        name: data.name || "",
        username: data.username || ""
      });
    } catch (err) {
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        handleAutoLogout();
      } else {
        showMessage("Failed to load profile", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // Auto logout when token is invalid
  const handleAutoLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("loginTime");
    navigate("/", { replace: true });
  };

  // Update profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data } = await axios.put("/api/users/profile", profileForm);
      setUser(data.user);
      
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      showMessage("Profile updated successfully!", "success");
    } catch (err) {
      if (err.response?.status === 401) {
        handleAutoLogout();
      } else {
        showMessage(err.response?.data?.message || "Failed to update profile", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("New passwords don't match", "error");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    
    try {
      await axios.put("/api/users/profile", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMessage("Password changed successfully!", "success");
    } catch (err) {
      if (err.response?.status === 401) {
        handleAutoLogout();
      } else {
        showMessage(err.response?.data?.message || "Failed to change password", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const handleAccountDelete = async (e) => {
    e.preventDefault();
    
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setLoading(true);
    
    try {
      await axios.delete("/api/users/profile", { data: deleteForm });
      showMessage("Account deleted successfully", "success");
      
      // Clear localStorage and redirect
      setTimeout(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("loginTime");
        navigate("/", { replace: true });
      }, 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAutoLogout();
      } else {
        showMessage(err.response?.data?.message || "Failed to delete account", "error");
        setLoading(false);
      }
    }
  };

  // Logout - Updated to clear both localStorage and cookies
  const handleLogout = async () => {
    try {
      // Call backend logout to clear cookie
      await axios.post("/api/users/logout");
    } catch (err) {
      console.error("Logout API error:", err);
      // Continue with client-side logout even if API fails
    } finally {
      // Always clear localStorage and redirect
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
      navigate("/", { replace: true });
    }
  };

  // Theme colors
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const cardBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-600";
  const inputBg = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300";
  const buttonPrimary = "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700";
  const buttonDanger = "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700";

  if (loading && !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-30"></div>
            <h1 className={`relative text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4`}>
              Profile Settings
            </h1>
          </div>
          <p className={`text-xl ${textMuted} max-w-2xl mx-auto`}>
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl transform transition-all duration-500 ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white max-w-sm`}>
            <div className="flex items-center">
              <span className="text-lg mr-3">
                {message.type === 'success' ? '✅' : '⚠️'}
              </span>
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-3xl shadow-2xl border ${cardBorder} p-6 sticky top-6 transition-all duration-300 hover:shadow-3xl`}>
              {/* User Card */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 ${cardBg} ${
                    user?.role === 'admin' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                </div>
                <h2 className={`text-xl font-bold ${textColor} mb-1`}>{user?.name}</h2>
                <p className={`text-sm ${textMuted} mb-2`}>@{user?.username}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: "profile", label: "Profile Info", icon: "👤" },
                  { id: "security", label: "Security", icon: "🔒" },
                  { id: "danger", label: "Danger Zone", icon: "⚠️" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} ${textColor}`
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className={`${cardBg} rounded-3xl shadow-2xl border ${cardBorder} p-8 transition-all duration-300 hover:shadow-3xl`}>
                <div className="flex items-center mb-8">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold">Profile Information</h2>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block font-semibold mb-3 ${textColor}`}>Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className={`w-full p-4 rounded-2xl border-2 ${inputBg} transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                        required
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-3 ${textColor}`}>Username</label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        className={`w-full p-4 rounded-2xl border-2 ${inputBg} transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-3 ${textColor}`}>Role</label>
                    <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textColor}`}>
                      <span className="font-medium capitalize">{user?.role}</span>
                      <p className={`text-sm mt-1 ${textMuted}`}>
                        {user?.role === 'admin' 
                          ? 'You have full administrative access to the system'
                          : 'You can process sales and view reports'
                        }
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={`block font-semibold mb-3 ${textColor}`}>Member Since</label>
                    <div className={`p-4 rounded-2xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} ${textColor}`}>
                      <span className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : buttonPrimary
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Updating Profile...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className={`${cardBg} rounded-3xl shadow-2xl border ${cardBorder} p-8 transition-all duration-300 hover:shadow-3xl`}>
                <div className="flex items-center mb-8">
                  <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-blue-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold">Security Settings</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className={`block font-semibold mb-3 ${textColor}`}>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className={`w-full p-4 rounded-2xl border-2 ${inputBg} transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block font-semibold mb-3 ${textColor}`}>New Password</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className={`w-full p-4 rounded-2xl border-2 ${inputBg} transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                        required
                        minLength="6"
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-3 ${textColor}`}>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className={`w-full p-4 rounded-2xl border-2 ${inputBg} transition-all duration-300 focus:ring-4 focus:ring-blue-500 focus:border-transparent ${textColor}`}
                        required
                        minLength="6"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                      loading ? 'bg-gray-400 cursor-not-allowed' : buttonPrimary
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        Changing Password...
                      </div>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === "danger" && (
              <div className={`${cardBg} rounded-3xl shadow-2xl border ${cardBorder} p-8 transition-all duration-300 hover:shadow-3xl`}>
                <div className="flex items-center mb-8">
                  <div className="w-2 h-8 bg-gradient-to-b from-red-400 to-orange-500 rounded-full mr-4"></div>
                  <h2 className="text-2xl font-bold">Danger Zone</h2>
                </div>

                <div className="space-y-6">
                  {!deleteConfirm ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-6">⚠️</div>
                      <h3 className="text-2xl font-bold mb-4 text-red-500">Delete Your Account</h3>
                      <p className={`text-lg mb-8 ${textMuted} max-w-md mx-auto`}>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </p>
                      <button
                        onClick={() => setDeleteConfirm(true)}
                        className={`py-4 px-8 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-2xl ${buttonDanger}`}
                      >
                        I Understand, Delete My Account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAccountDelete} className="space-y-6">
                      <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-red-500 mb-4">Confirm Account Deletion</h3>
                        <p className={`mb-4 ${textMuted}`}>
                          To confirm, please enter your password to permanently delete your account.
                        </p>
                        <input
                          type="password"
                          value={deleteForm.password}
                          onChange={(e) => setDeleteForm({ password: e.target.value })}
                          placeholder="Enter your password"
                          className={`w-full p-4 rounded-2xl border-2 ${inputBg} border-red-500 transition-all duration-300 focus:ring-4 focus:ring-red-500 focus:border-transparent ${textColor}`}
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(false)}
                          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg border-2 ${
                            darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                          } transition-all duration-300`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : buttonDanger
                          }`}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                              Deleting...
                            </div>
                          ) : (
                            "Permanently Delete Account"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;