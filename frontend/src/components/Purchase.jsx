import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Purchase = () => {
  const { darkMode } = useTheme();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    supplier_id: "",
    user_id: "",
    status: "paid",
    items: [{ medicine_id: "", quantity: 0, unit_price: 0, subtotal: 0 }],
  });
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setForm(prev => ({ ...prev, user_id: parsedUser._id }));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSuppliers();
      fetchMedicines();
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get("/api/purchases", { withCredentials: true });
      setPurchases(res.data || []);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load purchases");
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("/api/suppliers", { withCredentials: true });
      setSuppliers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines", { withCredentials: true });
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleItemChange = (index, e) => {
    const newItems = [...form.items];
    const value = e.target.name === "quantity" || e.target.name === "unit_price" ? Number(e.target.value) : e.target.value;
    newItems[index][e.target.name] = value;
    newItems[index].subtotal = newItems[index].quantity * newItems[index].unit_price;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { medicine_id: "", quantity: 0, unit_price: 0, subtotal: 0 }] });
  };

  const removeItem = (index) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleEdit = async (purchase) => {
    try {
      const res = await axios.get(`/api/purchases/${purchase._id}`, { withCredentials: true });
      const purchaseWithItems = res.data;
      setEditing(purchaseWithItems);

      setForm({
        supplier_id: purchaseWithItems.supplier_id?._id || "",
        user_id: user._id,
        status: purchaseWithItems.status || "paid",
        items: (purchaseWithItems.items || []).map(i => ({
          medicine_id: i.medicine_id?._id || "",
          quantity: i.quantity || 0,
          unit_price: i.unit_price || 0,
          subtotal: i.subtotal || 0
        }))
      });
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to fetch purchase details");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return showAlert("error", "User not found. Please login first.");

    const total_amount = form.items.reduce((acc, item) => acc + Number(item.subtotal), 0);
    setLoading(true);

    try {
      if (editing) {
        await axios.put(`/api/purchases/${editing._id}`, { ...form, total_amount }, { withCredentials: true });
        showAlert("success", "Purchase updated successfully! ✅");
        setEditing(null);
      } else {
        await axios.post("/api/purchases", { ...form, total_amount, user_id: user._id }, { withCredentials: true });
        showAlert("success", "Purchase added successfully! 📦");
      }

      setForm({
        supplier_id: "",
        user_id: user._id,
        status: "paid",
        items: [{ medicine_id: "", quantity: 0, unit_price: 0, subtotal: 0 }],
      });

      fetchPurchases();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error saving purchase");
    } finally {
      setLoading(false);
    }
  };

  // Filter purchases with safe access
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.supplier_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || purchase.supplier_id?._id === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  // Calculate statistics with safe access
  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.total_amount || 0), 0);
  const paidPurchases = purchases.filter(p => p.status === "paid").length;
  const pendingPurchases = purchases.filter(p => p.status === "pending").length;

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

  const getStatusColor = (status, darkMode) => {
    switch (status) {
      case "paid":
        return darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800";
      case "pending":
        return darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800";
      case "credit":
        return darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
      default:
        return darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid": return "✅";
      case "pending": return "⏳";
      case "credit": return "💰";
      default: return "📦";
    }
  };

  const calculateTotal = () => {
    return form.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  // Safe access for purchase items
  const getPurchaseItems = (purchase) => {
    return purchase.items || [];
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-orange-900/20 text-white" : "bg-gradient-to-br from-orange-50 to-amber-100 text-gray-800"}`}>
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
                  {alert.type === "success" ? "📦" : "!"}
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-4">
              Purchase Hub
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Manage supplier purchases and inventory restocking
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Purchases</p>
                  <p className="text-3xl font-bold text-orange-500">{totalPurchases}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Amount</p>
                  <p className="text-3xl font-bold text-green-500">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Paid Purchases</p>
                  <p className="text-3xl font-bold text-blue-500">{paidPurchases}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Pending</p>
                  <p className="text-3xl font-bold text-yellow-500">{pendingPurchases}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
            </div>
          </motion.div>

          {/* Purchase Form */}
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
                  darkMode ? "bg-orange-900/50" : "bg-orange-100"
                }`}>
                  {editing ? "✏️" : "📦"}
                </span>
                {editing ? "Update Purchase" : "Create New Purchase"}
              </h2>
              {editing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      supplier_id: "",
                      user_id: user._id,
                      status: "paid",
                      items: [{ medicine_id: "", quantity: 0, unit_price: 0, subtotal: 0 }],
                    });
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Supplier Selection */}
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
                        ? "bg-gray-700 border-gray-600 focus:border-orange-500 focus:ring-orange-500/20" 
                        : "bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                    }`}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(sup => (
                      <option key={sup._id} value={sup._id}>
                        {sup.name} - {sup.phone || "No Phone"}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Payment Status *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-orange-500 focus:ring-orange-500/20" 
                        : "bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                    }`}
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="credit">Credit</option>
                  </motion.select>
                </div>
              </div>

              {/* Purchase Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Purchase Items</h3>
                  <motion.button
                    type="button"
                    onClick={addItem}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      darkMode 
                        ? "bg-green-700 hover:bg-green-600 text-white" 
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    + Add Item
                  </motion.button>
                </div>

                {form.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid grid-cols-1 lg:grid-cols-5 gap-4 p-4 rounded-2xl border-2 ${
                      darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Medicine *
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        name="medicine_id"
                        value={item.medicine_id}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-orange-500 focus:ring-orange-500/20" 
                            : "bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                        }`}
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(med => (
                          <option key={med._id} value={med._id}>
                            {med.name} - Stock: {med.quantity_in_stock || 0}
                          </option>
                        ))}
                      </motion.select>
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Quantity
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        min="1"
                        required
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-orange-500 focus:ring-orange-500/20" 
                            : "bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Unit Price ($)
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        name="unit_price"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, e)}
                        min="0"
                        step="0.01"
                        required
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-orange-500 focus:ring-orange-500/20" 
                            : "bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Subtotal ($)
                      </label>
                      <input
                        type="number"
                        value={(item.subtotal || 0).toFixed(2)}
                        readOnly
                        className={`w-full p-3 rounded-xl border ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 text-white" 
                            : "bg-gray-100 border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>

                    <div className="flex items-end">
                      <motion.button
                        type="button"
                        onClick={() => removeItem(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                      >
                        Remove
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Total Amount */}
              <div className={`p-4 rounded-2xl ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-500">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all relative overflow-hidden ${
                  darkMode 
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white" 
                    : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white"
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : editing ? (
                  "Update Purchase"
                ) : (
                  "Create Purchase"
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
                placeholder="Search by supplier name or processor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-orange-500 focus:ring-orange-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500 focus:ring-orange-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
              }`}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="credit">Credit</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-orange-500 focus:ring-orange-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
              }`}
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Purchases Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPurchases.map((purchase) => {
                const purchaseItems = getPurchaseItems(purchase);
                
                return (
                  <motion.div
                    key={purchase._id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                      darkMode 
                        ? "bg-gray-800/80 border-gray-700 hover:border-orange-500" 
                        : "bg-white/80 border-white hover:border-orange-400"
                    } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <motion.h3 
                          className="text-xl font-bold truncate mb-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          {purchase.supplier_id?.name || "Unknown Supplier"}
                        </motion.h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(purchase.status, darkMode)}`}>
                            {getStatusIcon(purchase.status)} {purchase.status?.toUpperCase() || "UNKNOWN"}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                          }`}>
                            📅 {new Date(purchase.purchase_date || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <motion.span
                        whileHover={{ rotate: 360 }}
                        className={`text-3xl p-2 rounded-xl ${
                          darkMode ? "bg-gray-700" : "bg-orange-100"
                        }`}
                      >
                        📦
                      </motion.span>
                    </div>

                    {/* Purchase Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Total Amount:</span>
                        <span className="text-2xl font-bold text-green-500">${purchase.total_amount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Items Count:</span>
                        <span className="font-semibold">{purchaseItems.length} items</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Processed By:</span>
                        <span className="font-semibold">{purchase.user_id?.name || "System"}</span>
                      </div>
                      {purchase.supplier_id?.phone && (
                        <div className="flex justify-between items-center">
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Supplier Phone:</span>
                          <span className="font-semibold">{purchase.supplier_id.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Items Preview */}
                    <div className={`p-3 rounded-xl mb-4 ${
                      darkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}>
                      <p className="text-sm font-semibold mb-2">Items:</p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {purchaseItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="truncate flex-1">{item.name || "Unknown Item"}</span>
                            <span className="ml-2">x{item.quantity || 0}</span>
                          </div>
                        ))}
                        {purchaseItems.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{purchaseItems.length - 3} more items
                          </div>
                        )}
                        {purchaseItems.length === 0 && (
                          <div className="text-sm text-gray-500">No items</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(purchase)}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        darkMode 
                          ? "bg-yellow-600 hover:bg-yellow-500 text-white" 
                          : "bg-yellow-400 hover:bg-yellow-500 text-white"
                      }`}
                    >
                      Edit Purchase
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredPurchases.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold mb-2">No purchases found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm || statusFilter !== "all" || supplierFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Create your first purchase to get started"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Purchase;