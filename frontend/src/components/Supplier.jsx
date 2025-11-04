import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Supplier = () => {
  const { darkMode } = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", contact: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const API_URL = "/api/suppliers";
  // const API_URL = "http://localhost:5000/api/suppliers";

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(API_URL, { withCredentials: true });
      setSuppliers(res.data || []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load suppliers");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_URL}/${editingId}`, form, { withCredentials: true });
        showAlert("success", "Supplier updated successfully! ✅");
        setSuppliers((prev) =>
          prev.map((s) => (s._id === editingId ? res.data : s))
        );
      } else {
        const res = await axios.post(API_URL, form, { withCredentials: true });
        showAlert("success", "Supplier added successfully! 🏢");
        setSuppliers([res.data, ...suppliers]);
      }
      setForm({ name: "", contact: "", address: "" });
      setEditingId(null);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error saving supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setForm({ name: supplier.name, contact: supplier.contact, address: supplier.address });
    setEditingId(supplier._id);
    setSelectedSupplier(supplier);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
      setSuppliers(suppliers.filter((s) => s._id !== id));
      showAlert("success", "Supplier deleted successfully! 🗑️");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error deleting supplier");
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleCloseDetails = () => {
    setSelectedSupplier(null);
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalSuppliers = suppliers.length;
  const suppliersWithContact = suppliers.filter(s => s.contact).length;
  const suppliersWithAddress = suppliers.filter(s => s.address).length;

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

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-indigo-900/20 text-white" : "bg-gradient-to-br from-indigo-50 to-purple-100 text-gray-800"}`}>
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
                  {alert.type === "success" ? "🏢" : "!"}
                </div>
                <p className="font-semibold">{alert.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Supplier Details Modal */}
        <AnimatePresence>
          {selectedSupplier && !editingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={handleCloseDetails}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`rounded-3xl shadow-2xl max-w-md w-full p-6 ${
                  darkMode ? "bg-gray-800" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold flex items-center">
                    <span className={`p-2 rounded-lg mr-3 ${
                      darkMode ? "bg-indigo-900/50" : "bg-indigo-100"
                    }`}>
                      🏢
                    </span>
                    Supplier Details
                  </h3>
                  <button
                    onClick={handleCloseDetails}
                    className={`p-2 rounded-xl ${
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      Name
                    </label>
                    <p className="text-lg font-semibold">{selectedSupplier.name}</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      Contact
                    </label>
                    <p className={selectedSupplier.contact ? "text-lg" : "text-gray-500 italic"}>
                      {selectedSupplier.contact || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-1 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                      Address
                    </label>
                    <p className={selectedSupplier.address ? "text-lg" : "text-gray-500 italic"}>
                      {selectedSupplier.address || "Not provided"}
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        handleEdit(selectedSupplier);
                        handleCloseDetails();
                      }}
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
                      onClick={() => {
                        handleDelete(selectedSupplier._id);
                        handleCloseDetails();
                      }}
                      className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                        darkMode 
                          ? "bg-red-700 hover:bg-red-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Supplier Network
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Manage your supplier relationships and partnerships
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Suppliers</p>
                  <p className="text-3xl font-bold text-indigo-500">{totalSuppliers}</p>
                </div>
                <div className="text-4xl">🏢</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>With Contact</p>
                  <p className="text-3xl font-bold text-green-500">{suppliersWithContact}</p>
                </div>
                <div className="text-4xl">📞</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>With Address</p>
                  <p className="text-3xl font-bold text-blue-500">{suppliersWithAddress}</p>
                </div>
                <div className="text-4xl">📍</div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            variants={itemVariants}
            className={`rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/80 border-gray-700" 
                : "bg-white/80 border-white"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? "bg-indigo-900/50" : "bg-indigo-100"
                }`}>
                  {editingId ? "✏️" : "➕"}
                </span>
                {editingId ? "Edit Supplier" : "Add New Supplier"}
              </h2>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", contact: "", address: "" });
                  }}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Cancel Edit
                </motion.button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Supplier Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="name"
                    placeholder="Enter supplier name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                        : "bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Contact Information
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="contact"
                    placeholder="Phone, email, or other contact"
                    value={form.contact}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                        : "bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="address"
                    placeholder="Enter supplier address"
                    value={form.address}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20" 
                        : "bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
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
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white" 
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white"
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : editingId ? (
                  "Update Supplier"
                ) : (
                  "Add Supplier"
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
                Showing: <span className="text-indigo-500">{filteredSuppliers.length}</span> of <span className="text-purple-500">{totalSuppliers}</span> suppliers
              </p>
            </div>
            
            <div className="relative w-full md:w-64">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </motion.div>

          {/* Suppliers Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredSuppliers.map((supplier) => (
                <motion.div
                  key={supplier._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/80 border-gray-700 hover:border-indigo-500" 
                      : "bg-white/80 border-white hover:border-indigo-400"
                  } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <motion.h3 
                      className="text-xl font-bold truncate flex-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      {supplier.name}
                    </motion.h3>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-2xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-indigo-100"
                      }`}
                    >
                      🏢
                    </motion.span>
                  </div>
                  
                  {/* Supplier Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📞</span>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} ${
                        !supplier.contact ? "italic text-gray-400" : ""
                      }`}>
                        {supplier.contact || "Not provided"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-lg mr-3 mt-1">📍</span>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} ${
                        !supplier.address ? "italic text-gray-400" : ""
                      }`}>
                        {supplier.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewDetails(supplier)}
                      className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${
                        darkMode 
                          ? "bg-blue-600 hover:bg-blue-500 text-white" 
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(supplier)}
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
                      onClick={() => handleDelete(supplier._id)}
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
          {filteredSuppliers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold mb-2">No suppliers found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first supplier"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Supplier;