import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Category = () => {
  const { darkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = "/api/categories";
  // const API_URL = "http://localhost:5000/api/categories";

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, form, { withCredentials: true });
        showAlert("success", "Category updated successfully!");
        setCategories((prev) =>
          prev.map((c) => (c._id === editingId ? res.data : c))
        );
      } else {
        const res = await axios.post(API_URL, form, { withCredentials: true });
        showAlert("success", "Category added successfully!");
        setCategories([res.data, ...categories]);
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error saving category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({ name: category.name, description: category.description });
    setEditingId(category._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setCategories(categories.filter((c) => c._id !== id));
      showAlert("success", "Category deleted successfully!");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error deleting category");
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      scale: 0.9,
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800"}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Alert */}
        <AnimatePresence>
          {alert.visible && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 p-4 rounded-2xl shadow-2xl border-l-4 ${
                alert.type === "success"
                  ? darkMode 
                    ? "bg-green-900 border-green-400 text-green-100" 
                    : "bg-green-50 border-green-500 text-green-800"
                  : darkMode 
                    ? "bg-red-900 border-red-400 text-red-100" 
                    : "bg-red-50 border-red-500 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  alert.type === "success" 
                    ? darkMode ? "bg-green-700" : "bg-green-100" 
                    : darkMode ? "bg-red-700" : "bg-red-100"
                }`}>
                  {alert.type === "success" ? "✓" : "!"}
                </div>
                <p className="font-semibold">{alert.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Category Manager
            </h1>
            <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Organize and manage your categories with style
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            variants={itemVariants}
            className={`rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm ${
              darkMode 
                ? "bg-gray-800/80 border border-gray-700" 
                : "bg-white/80 border border-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className={`p-2 rounded-lg mr-3 ${
                darkMode ? "bg-blue-900/50" : "bg-blue-100"
              }`}>
                {editingId ? "✏️" : "➕"}
              </span>
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Category Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="name"
                    placeholder="Enter category name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20" 
                        : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Description
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="description"
                    placeholder="Enter description"
                    value={form.description}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20" 
                        : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all relative overflow-hidden ${
                  darkMode 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white" 
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : editingId ? (
                  "Update Category"
                ) : (
                  "Add Category"
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Search and Stats */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className={`px-6 py-3 rounded-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            } shadow-lg`}>
              <p className="font-semibold">
                Total Categories: <span className="text-blue-500">{categories.length}</span>
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/80 border-gray-700 hover:border-blue-500" 
                      : "bg-white/80 border-white hover:border-blue-400"
                  } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <motion.h3 
                      className="text-xl font-bold truncate"
                      whileHover={{ scale: 1.05 }}
                    >
                      {category.name}
                    </motion.h3>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-2xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-blue-100"
                      }`}
                    >
                      📁
                    </motion.span>
                  </div>
                  
                  <p className={`mb-6 line-clamp-2 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {category.description || "No description provided"}
                  </p>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(category)}
                      className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                        darkMode 
                          ? "bg-yellow-600 hover:bg-yellow-500 text-white" 
                          : "bg-yellow-400 hover:bg-yellow-500 text-white"
                      }`}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(category._id)}
                      className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                        darkMode 
                          ? "bg-red-700 hover:bg-red-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-2xl font-bold mb-2">No categories found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first category"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Category;