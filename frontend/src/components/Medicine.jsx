import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Medicine = () => {
  const { darkMode } = useTheme();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    supplier_id: "",
    quantity_in_stock: 0,
    buying_price: 0,
    selling_price: 0,
    expiry_date: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  // Load data
  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines", { withCredentials: true });
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load medicines");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories", { withCredentials: true });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/api/suppliers", { withCredentials: true });
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/medicines/${editingId}`, form, { withCredentials: true });
        showAlert("success", "Medicine updated successfully! ✅");
      } else {
        await axios.post("/api/medicines", form, { withCredentials: true });
        showAlert("success", "Medicine added successfully! 💊");
      }
      setForm({ name: "", category_id: "", supplier_id: "", quantity_in_stock: 0, buying_price: 0, selling_price: 0, expiry_date: "" });
      setEditingId(null);
      fetchMedicines();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error saving medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (med) => {
    setEditingId(med._id);
    setForm({
      name: med.name,
      category_id: med.category_id?._id || "",
      supplier_id: med.supplier_id?._id || "",
      quantity_in_stock: med.quantity_in_stock,
      buying_price: med.buying_price,
      selling_price: med.selling_price,
      expiry_date: med.expiry_date ? med.expiry_date.split("T")[0] : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await axios.delete(`/api/medicines/${id}`, { withCredentials: true });
        showAlert("success", "Medicine deleted successfully! 🗑️");
        fetchMedicines();
      } catch (err) {
        showAlert("error", "Failed to delete medicine");
      }
    }
  };

  const handleAdjustStock = async (id) => {
    const qty = parseInt(prompt("Enter quantity change (+/-):"));
    if (!isNaN(qty)) {
      try {
        await axios.post(`/api/medicines/${id}/stock`, { 
          quantity_change: qty, 
          change_type: "manual", 
          user_id: "admin" 
        }, { withCredentials: true });
        showAlert("success", `Stock adjusted by ${qty > 0 ? '+' : ''}${qty}! 📦`);
        fetchMedicines();
      } catch (err) {
        showAlert("error", "Failed to adjust stock");
      }
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.category_id?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "low" && medicine.quantity_in_stock < 10) ||
                        (stockFilter === "out" && medicine.quantity_in_stock === 0);
    
    const now = new Date();
    const expiryDate = new Date(medicine.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    
    const matchesExpiry = expiryFilter === "all" ||
                         (expiryFilter === "expired" && daysUntilExpiry < 0) ||
                         (expiryFilter === "soon" && daysUntilExpiry >= 0 && daysUntilExpiry <= 30);

    return matchesSearch && matchesStock && matchesExpiry;
  });

  // Calculate statistics
  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(m => m.quantity_in_stock < 10).length;
  const expiredMedicines = medicines.filter(m => new Date(m.expiry_date) < new Date()).length;
  const totalValue = medicines.reduce((sum, med) => sum + (med.quantity_in_stock * med.buying_price), 0);

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

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: "Out of Stock", color: "red", bg: darkMode ? "bg-red-900/50" : "bg-red-100", border: darkMode ? "border-red-700" : "border-red-300" };
    if (quantity < 10) return { text: "Low Stock", color: "orange", bg: darkMode ? "bg-orange-900/50" : "bg-orange-100", border: darkMode ? "border-orange-700" : "border-orange-300" };
    return { text: "In Stock", color: "green", bg: darkMode ? "bg-green-900/50" : "bg-green-100", border: darkMode ? "border-green-700" : "border-green-300" };
  };

  const getExpiryStatus = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { text: "Expired", color: "red", icon: "⚠️" };
    if (daysUntilExpiry <= 30) return { text: "Expiring Soon", color: "orange", icon: "⏳" };
    return { text: "Valid", color: "green", icon: "✅" };
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-teal-900/20 text-white" : "bg-gradient-to-br from-teal-50 to-blue-100 text-gray-800"}`}>
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
                  {alert.type === "success" ? "💊" : "!"}
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent mb-4">
              Pharmacy Inventory
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Manage your medicine stock with precision and care
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Medicines</p>
                  <p className="text-3xl font-bold text-blue-500">{totalMedicines}</p>
                </div>
                <div className="text-4xl">💊</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Low Stock</p>
                  <p className="text-3xl font-bold text-orange-500">{lowStockMedicines}</p>
                </div>
                <div className="text-4xl">📉</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Expired</p>
                  <p className="text-3xl font-bold text-red-500">{expiredMedicines}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Value</p>
                  <p className="text-3xl font-bold text-green-500">${totalValue.toFixed(2)}</p>
                </div>
                <div className="text-4xl">💰</div>
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
                  darkMode ? "bg-teal-900/50" : "bg-teal-100"
                }`}>
                  {editingId ? "✏️" : "➕"}
                </span>
                {editingId ? "Edit Medicine" : "Add New Medicine"}
              </h2>
              {editingId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingId(null);
                    setForm({ name: "", category_id: "", supplier_id: "", quantity_in_stock: 0, buying_price: 0, selling_price: 0, expiry_date: "" });
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Medicine Name *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter medicine name"
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Category *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Supplier */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Supplier *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="supplier_id"
                    value={form.supplier_id}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup._id} value={sup._id}>
                        {sup.name}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Quantity */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Quantity in Stock *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    name="quantity_in_stock"
                    type="number"
                    value={form.quantity_in_stock}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    min="0"
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  />
                </div>

                {/* Buying Price */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Buying Price ($) *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    name="buying_price"
                    type="number"
                    step="0.01"
                    value={form.buying_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    min="0"
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Selling Price ($) *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    name="selling_price"
                    type="number"
                    step="0.01"
                    value={form.selling_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                    min="0"
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                  />
                </div>

                {/* Expiry Date */}
                <div className="md:col-span-3">
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Expiry Date *
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    name="expiry_date"
                    type="date"
                    value={form.expiry_date}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20" 
                        : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
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
                    ? "bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white" 
                    : "bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white"
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : editingId ? (
                  "Update Medicine"
                ) : (
                  "Add Medicine"
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search medicines by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
              }`}
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-teal-500 focus:ring-teal-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500/20"
              }`}
            >
              <option value="all">All Expiry</option>
              <option value="soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </motion.div>

          {/* Medicine Cards Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredMedicines.map((medicine) => {
                const stockStatus = getStockStatus(medicine.quantity_in_stock);
                const expiryStatus = getExpiryStatus(medicine.expiry_date);
                const profit = medicine.selling_price - medicine.buying_price;
                const profitMargin = ((profit / medicine.buying_price) * 100).toFixed(1);

                return (
                  <motion.div
                    key={medicine._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${stockStatus.border} ${
                      darkMode 
                        ? "bg-gray-800/80 hover:border-teal-500" 
                        : "bg-white/80 hover:border-teal-400"
                    } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold truncate mb-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          {medicine.name}
                        </motion.h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${stockStatus.bg} ${darkMode ? `text-${stockStatus.color}-300` : `text-${stockStatus.color}-700`}`}>
                            {stockStatus.text}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            expiryStatus.color === 'red' 
                              ? darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                              : expiryStatus.color === 'orange'
                              ? darkMode ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                              : darkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                          }`}>
                            {expiryStatus.icon} {expiryStatus.text}
                          </span>
                        </div>
                      </div>
                      <motion.span
                        whileHover={{ rotate: 360 }}
                        className={`text-3xl p-2 rounded-xl ${
                          darkMode ? "bg-gray-700" : "bg-teal-100"
                        }`}
                      >
                        💊
                      </motion.span>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Category:</span>
                        <span className="font-semibold">{medicine.category_id?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Supplier:</span>
                        <span className="font-semibold">{medicine.supplier_id?.name || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Stock:</span>
                        <span className={`font-bold text-lg ${
                          medicine.quantity_in_stock === 0 
                            ? "text-red-500" 
                            : medicine.quantity_in_stock < 10 
                            ? "text-orange-500" 
                            : "text-green-500"
                        }`}>
                          {medicine.quantity_in_stock} units
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Buying:</span>
                        <span className="font-semibold">${medicine.buying_price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Selling:</span>
                        <span className="font-semibold">${medicine.selling_price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Profit Margin:</span>
                        <span className={`font-bold ${profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {profitMargin}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Expiry:</span>
                        <span className={`font-semibold ${expiryStatus.color === 'red' ? 'text-red-500' : expiryStatus.color === 'orange' ? 'text-orange-500' : 'text-green-500'}`}>
                          {new Date(medicine.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEdit(medicine)}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
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
                        onClick={() => handleAdjustStock(medicine._id)}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
                          darkMode 
                            ? "bg-green-600 hover:bg-green-500 text-white" 
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        Adjust
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(medicine._id)}
                        className={`flex-1 py-2 px-3 rounded-xl font-semibold transition-all ${
                          darkMode 
                            ? "bg-red-700 hover:bg-red-600 text-white" 
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredMedicines.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">💊</div>
              <h3 className="text-2xl font-bold mb-2">No medicines found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm || stockFilter !== "all" || expiryFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Get started by adding your first medicine"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Medicine;