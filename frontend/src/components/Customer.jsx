import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Customer = () => {
  const { darkMode } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });
  const [editId, setEditId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers", { withCredentials: true });
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/customers/${editId}`, formData, { withCredentials: true });
        showAlert("success", "Customer updated successfully! 🎉");
      } else {
        await axios.post("http://localhost:5000/api/customers", formData, { withCredentials: true });
        showAlert("success", "Customer added successfully! 👥");
      }
      setFormData({ name: "", phone: "", address: "" });
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error saving customer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({ name: customer.name, phone: customer.phone || "", address: customer.address || "" });
    setEditId(customer._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/customers/${id}`, { withCredentials: true });
      showAlert("success", "Customer deleted successfully! 🗑️");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Error deleting customer");
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-blue-900/20 text-white" : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800"}`}>
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
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Customer Hub
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Manage your customer relationships with elegance
            </p>
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
                  darkMode ? "bg-blue-900/50" : "bg-blue-100"
                }`}>
                  {editId ? "✏️" : "👤"}
                </span>
                {editId ? "Edit Customer" : "Add New Customer"}
              </h2>
              {editId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditId(null);
                    setFormData({ name: "", phone: "", address: "" });
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
                    Full Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter customer name"
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
                    Phone Number
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
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
                    Address
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
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
                ) : editId ? (
                  "Update Customer"
                ) : (
                  "Add Customer"
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
                Total Customers: <span className="text-blue-500">{customers.length}</span>
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <motion.input
                whileFocus={{ scale: 1.05 }}
                type="text"
                placeholder="Search customers by name, phone, or address..."
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

          {/* Customers Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCustomers.map((customer) => (
                <motion.div
                  key={customer._id}
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
                      className="text-xl font-bold truncate flex-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      {customer.name}
                    </motion.h3>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-2xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-blue-100"
                      }`}
                    >
                      👤
                    </motion.span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">📱</span>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} ${
                        !customer.phone ? "italic text-gray-400" : ""
                      }`}>
                        {customer.phone || "Not provided"}
                      </p>
                    </div>
                    <div className="flex items-start">
                      <span className="text-lg mr-3 mt-1">🏠</span>
                      <p className={`${darkMode ? "text-gray-300" : "text-gray-600"} ${
                        !customer.address ? "italic text-gray-400" : ""
                      }`}>
                        {customer.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(customer)}
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
                      onClick={() => handleDelete(customer._id)}
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
          {filteredCustomers.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-2">No customers found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first customer"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Customer;