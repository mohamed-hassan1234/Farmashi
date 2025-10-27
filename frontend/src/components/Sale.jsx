import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Sale = () => {
  const { darkMode } = useTheme();
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    sale_type: "cash",
    amount_paid: 0,
    items: [{ medicine_id: "", name: "", quantity: 0, price: 0, subtotal: 0, stock: 0 }],
  });
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [saleTypeFilter, setSaleTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  useEffect(() => {
    fetchCustomers();
    fetchMedicines();
    fetchSales();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/medicines");
      setMedicines(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sales");
      setSales(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const computeSubtotal = (q, p) => Math.round((q * p + Number.EPSILON) * 100) / 100;
  const totalAmount = form.items.reduce((acc, it) => acc + (it.subtotal || 0), 0);
  const balance = totalAmount - (form.amount_paid || 0);

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      const item = { ...items[index] };

      if (field === "medicine_id") {
        const med = medicines.find(m => m._id === value);
        if (med) {
          item.medicine_id = med._id;
          item.name = med.name;
          item.price = med.selling_price;
          item.stock = med.quantity_in_stock;
          item.quantity = 0;
        }
      } else if (field === "quantity") {
        let q = Number(value || 0);
        if (q > item.stock) {
          q = item.stock;
          showAlert("error", `Quantity cannot exceed stock (${item.stock}) for ${item.name}`);
        }
        item.quantity = q;
      } else if (field === "price") {
        item.price = Number(value);
      }

      item.subtotal = computeSubtotal(item.quantity || 0, item.price || 0);
      items[index] = item;
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { medicine_id: "", name: "", quantity: 0, price: 0, subtotal: 0, stock: 0 }]
    }));
  };

  const removeItem = (index) => {
    setForm(prev => {
      const items = [...prev.items];
      items.splice(index, 1);
      return { ...prev, items: items.length ? items : [{ medicine_id: "", name: "", quantity: 0, price: 0, subtotal: 0, stock: 0 }] };
    });
  };

  const validateBeforeSubmit = () => {
    if (!form.customer_id) {
      showAlert("error", "Please select a customer.");
      return false;
    }
    const validItems = form.items.filter(it => it.medicine_id && it.quantity > 0 && it.price > 0);
    if (validItems.length === 0) {
      showAlert("error", "Add at least one valid item.");
      return false;
    }
    for (const it of validItems) {
      if (it.quantity > it.stock) {
        showAlert("error", `Quantity for ${it.name} exceeds stock.`);
        return false;
      }
    }
    if (form.amount_paid > totalAmount) {
      showAlert("error", "Amount paid cannot exceed total.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateBeforeSubmit()) return;

    setLoading(true);

    try {
      const payloadItems = form.items.filter(it => it.medicine_id && it.quantity > 0 && it.price > 0);
      const payload = {
        customer_id: form.customer_id,
        items: payloadItems,
        sale_type: form.sale_type,
        amount_paid: Number(form.amount_paid),
      };
      const res = await axios.post("http://localhost:5000/api/sales", payload);
      showAlert("success", res.data.message || "Sale recorded successfully! 🎉");
      setForm({
        customer_id: "",
        sale_type: "cash",
        amount_paid: 0,
        items: [{ medicine_id: "", name: "", quantity: 0, price: 0, subtotal: 0, stock: 0 }],
      });
      fetchMedicines();
      fetchSales();
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = saleTypeFilter === "all" || sale.sale_type === saleTypeFilter;
    
    const saleDate = new Date(sale.sale_date);
    const now = new Date();
    const matchesDate = dateFilter === "all" ||
                       (dateFilter === "today" && saleDate.toDateString() === now.toDateString()) ||
                       (dateFilter === "week" && (now - saleDate) / (1000 * 60 * 60 * 24) <= 7);

    return matchesSearch && matchesType && matchesDate;
  });

  // Calculate statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  const cashSales = sales.filter(s => s.sale_type === "cash").length;
  const creditSales = sales.filter(s => s.sale_type === "credit").length;

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

  const getSaleTypeColor = (type, darkMode) => {
    return type === "cash" 
      ? darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
      : darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800";
  };

  const getSaleTypeIcon = (type) => {
    return type === "cash" ? "💵" : "💰";
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-emerald-900/20 text-white" : "bg-gradient-to-br from-emerald-50 to-teal-100 text-gray-800"}`}>
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
                  {alert.type === "success" ? "💰" : "!"}
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-4">
              Sales Dashboard
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Process sales and manage customer transactions with ease
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Sales</p>
                  <p className="text-3xl font-bold text-emerald-500">{totalSales}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Revenue</p>
                  <p className="text-3xl font-bold text-green-500">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="text-4xl">💵</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cash Sales</p>
                  <p className="text-3xl font-bold text-blue-500">{cashSales}</p>
                </div>
                <div className="text-4xl">💵</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Credit Sales</p>
                  <p className="text-3xl font-bold text-purple-500">{creditSales}</p>
                </div>
                <div className="text-4xl">📝</div>
              </div>
            </div>
          </motion.div>

          {/* Sale Form */}
          <motion.div
            variants={itemVariants}
            className={`rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/80 border-gray-700" 
                : "bg-white/80 border-white"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className={`p-2 rounded-lg mr-3 ${
                darkMode ? "bg-emerald-900/50" : "bg-emerald-100"
              }`}>
                🧾
              </span>
              Create New Sale
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer and Sale Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Selection */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Customer *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="customer_id"
                    value={form.customer_id}
                    onChange={handleFormChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20" 
                        : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    }`}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} - {c.phone || "No Phone"}
                      </option>
                    ))}
                  </motion.select>
                </div>

                {/* Sale Type */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Sale Type *
                  </label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    name="sale_type"
                    value={form.sale_type}
                    onChange={handleFormChange}
                    required
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20" 
                        : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    }`}
                  >
                    <option value="cash">Cash 💵</option>
                    <option value="credit">Credit 📝</option>
                  </motion.select>
                </div>

                {/* Amount Paid */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Amount Paid ($)
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="number"
                    name="amount_paid"
                    value={form.amount_paid}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                      darkMode 
                        ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20" 
                        : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    }`}
                  />
                  <div className={`mt-2 p-3 rounded-xl ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-bold text-lg">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Balance:</span>
                      <span className={`font-bold text-lg ${
                        balance > 0 ? "text-orange-500" : "text-green-500"
                      }`}>
                        ${balance.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sale Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Sale Items</h3>
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

                {form.items.map((it, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`grid grid-cols-1 lg:grid-cols-6 gap-4 p-4 rounded-2xl border-2 ${
                      darkMode ? "bg-gray-700/50 border-gray-600" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {/* Medicine Selection */}
                    <div className="lg:col-span-2">
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Medicine *
                      </label>
                      <motion.select
                        whileFocus={{ scale: 1.02 }}
                        value={it.medicine_id}
                        onChange={(e) => handleItemChange(idx, "medicine_id", e.target.value)}
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20" 
                            : "bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name} — Stock: {m.quantity_in_stock}
                          </option>
                        ))}
                      </motion.select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Quantity
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        min="0"
                        max={it.stock}
                        value={it.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20" 
                            : "bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Unit Price ($)
                      </label>
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.price}
                        onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                        className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 focus:border-emerald-500 focus:ring-emerald-500/20" 
                            : "bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                      />
                    </div>

                    {/* Subtotal */}
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}>
                        Subtotal ($)
                      </label>
                      <input
                        type="number"
                        readOnly
                        value={(it.subtotal || 0).toFixed(2)}
                        className={`w-full p-3 rounded-xl border ${
                          darkMode 
                            ? "bg-gray-600 border-gray-500 text-white" 
                            : "bg-gray-100 border-gray-300 text-gray-800"
                        }`}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-end gap-2">
                      <motion.button
                        type="button"
                        onClick={() => removeItem(idx)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                      >
                        Remove
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all relative overflow-hidden ${
                  darkMode 
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white" 
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                }`}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : (
                  "Process Sale 🧾"
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
                placeholder="Search by customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={saleTypeFilter}
              onChange={(e) => setSaleTypeFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
            >
              <option value="all">All Types</option>
              <option value="cash">Cash Sales</option>
              <option value="credit">Credit Sales</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
          </motion.div>

          {/* Sales Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredSales.map((sale) => (
                <motion.div
                  key={sale._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/80 border-gray-700 hover:border-emerald-500" 
                      : "bg-white/80 border-white hover:border-emerald-400"
                  } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <motion.h3 
                        className="text-xl font-bold truncate mb-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        {sale.customer_id?.name || "Unknown Customer"}
                      </motion.h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSaleTypeColor(sale.sale_type, darkMode)}`}>
                          {getSaleTypeIcon(sale.sale_type)} {sale.sale_type?.toUpperCase() || "UNKNOWN"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}>
                          📅 {new Date(sale.sale_date || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-3xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-emerald-100"
                      }`}
                    >
                      🧾
                    </motion.span>
                  </div>

                  {/* Sale Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Total Amount:</span>
                      <span className="text-2xl font-bold text-green-500">${sale.total_amount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Amount Paid:</span>
                      <span className="text-xl font-semibold text-blue-500">${sale.amount_paid || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Balance:</span>
                      <span className={`text-xl font-semibold ${
                        (sale.balance || 0) > 0 ? "text-orange-500" : "text-green-500"
                      }`}>
                        ${sale.balance || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Items Count:</span>
                      <span className="font-semibold">{(sale.items || []).length} items</span>
                    </div>
                    {sale.customer_id?.phone && (
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Customer Phone:</span>
                        <span className="font-semibold">{sale.customer_id.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className={`p-3 rounded-xl mb-4 ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <p className="text-sm font-semibold mb-2">Items:</p>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {(sale.items || []).slice(0, 3).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate flex-1">{item.name || "Unknown Item"}</span>
                          <span className="ml-2">x{item.quantity || 0}</span>
                        </div>
                      ))}
                      {(sale.items || []).length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{(sale.items || []).length - 3} more items
                        </div>
                      )}
                      {(sale.items || []).length === 0 && (
                        <div className="text-sm text-gray-500">No items</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredSales.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-2xl font-bold mb-2">No sales found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm || saleTypeFilter !== "all" || dateFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Process your first sale to get started"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Sale;