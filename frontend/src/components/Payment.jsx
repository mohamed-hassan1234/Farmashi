import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

const Payment = () => {
  const { darkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newPayment, setNewPayment] = useState({
    customer_id: "",
    sale_id: "",
    type: "customer_payment",
    amount: "",
    method: "cash",
  });
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  useEffect(() => { 
    fetchPayments();
    fetchCustomers();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/api/payments");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load payments");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomerSales = async (customerId) => {
    try {
      const res = await axios.get(`/api/sales/customer/${customerId}`);
      setSales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    const updatedPayment = { ...newPayment, [field]: value };
    
    if (field === "customer_id") {
      fetchCustomerSales(value);
      updatedPayment.sale_id = ""; // Reset sale when customer changes
    }
    
    setNewPayment(updatedPayment);
  };

  const addPayment = async () => {
    const { customer_id, sale_id, type, amount, method } = newPayment;
    if (!customer_id || !sale_id || !type || !amount) {
      return showAlert("error", "Please fill all required fields");
    }

    setLoading(true);

    try {
      await axios.post("/api/payments", {
        related_id: sale_id,
        type,
        amount: Number(amount),
        method,
        customer_id
      });

      showAlert("success", "Payment processed successfully! 💰");
      setNewPayment({ 
        customer_id: "", 
        sale_id: "", 
        type: "customer_payment", 
        amount: "", 
        method: "cash" 
      });
      setSales([]);
      fetchPayments();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Failed to process payment");
    } finally { 
      setLoading(false); 
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(payments.map(payment => ({
      "Customer": payment.customer_id?.name || "N/A",
      "Type": payment.type.replace('_', ' ').toUpperCase(),
      "Amount": `$${payment.amount}`,
      "Method": payment.method.toUpperCase(),
      "Date": new Date(payment.date).toLocaleDateString(),
      "Time": new Date(payment.date).toLocaleTimeString(),
      "Processed By": payment.user_id?.name || "System"
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, `payments_${new Date().toISOString().split('T')[0]}.xlsx`);
    showAlert("success", "Payments exported to Excel! 📊");
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || payment.type === typeFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    
    const paymentDate = new Date(payment.date);
    const now = new Date();
    const matchesDate = dateFilter === "all" ||
                       (dateFilter === "today" && paymentDate.toDateString() === now.toDateString()) ||
                       (dateFilter === "week" && (now - paymentDate) / (1000 * 60 * 60 * 24) <= 7) ||
                       (dateFilter === "month" && paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear());

    return matchesSearch && matchesType && matchesMethod && matchesDate;
  });

  // Calculate statistics
  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const customerPayments = filteredPayments.filter(p => p.type === "customer_payment").length;
  const supplierPayments = filteredPayments.filter(p => p.type === "supplier_payment").length;

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

  const getPaymentTypeColor = (type, darkMode) => {
    return type === "customer_payment" 
      ? darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
      : darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800";
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case "cash": return "💵";
      case "credit": return "💳";
      case "mobile": return "📱";
      default: return "💰";
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-purple-900/20 text-white" : "bg-gradient-to-br from-purple-50 to-pink-100 text-gray-800"}`}>
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent mb-4">
              Payment Hub
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Manage customer and supplier payments with ease
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Payments</p>
                  <p className="text-3xl font-bold text-purple-500">{totalPayments}</p>
                </div>
                <div className="text-4xl">💰</div>
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
                <div className="text-4xl">💵</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Customer Payments</p>
                  <p className="text-3xl font-bold text-blue-500">{customerPayments}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Supplier Payments</p>
                  <p className="text-3xl font-bold text-orange-500">{supplierPayments}</p>
                </div>
                <div className="text-4xl">🏢</div>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
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
                darkMode ? "bg-purple-900/50" : "bg-purple-100"
              }`}>
                💰
              </span>
              Process New Payment
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Customer Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Customer *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={newPayment.customer_id}
                  onChange={(e) => handleChange("customer_id", e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20" 
                      : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.phone || "No Phone"}
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Sale Selection */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Sale Reference *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={newPayment.sale_id}
                  onChange={(e) => handleChange("sale_id", e.target.value)}
                  disabled={!newPayment.customer_id}
                  className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20" 
                      : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  } ${!newPayment.customer_id ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">Select Sale</option>
                  {sales.map((sale) => (
                    <option key={sale._id} value={sale._id}>
                      Sale #{sale._id.slice(-6)} - ${sale.total_amount} (Balance: ${sale.balance})
                    </option>
                  ))}
                </motion.select>
              </div>

              {/* Payment Type */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Payment Type *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={newPayment.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20" 
                      : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                >
                  <option value="customer_payment">Customer Payment</option>
                  <option value="supplier_payment">Supplier Payment</option>
                </motion.select>
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Amount ($) *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newPayment.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20" 
                      : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Payment Method *
                </label>
                <motion.select
                  whileFocus={{ scale: 1.02 }}
                  value={newPayment.method}
                  onChange={(e) => handleChange("method", e.target.value)}
                  className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                    darkMode 
                      ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20" 
                      : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                >
                  <option value="cash">Cash 💵</option>
                  <option value="credit">Credit Card 💳</option>
                  <option value="mobile">Mobile Payment 📱</option>
                </motion.select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addPayment}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all relative overflow-hidden ${
                darkMode 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white"
              }`}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto"
                />
              ) : (
                "Process Payment 💰"
              )}
            </motion.button>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search by customer name or processor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                }`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            >
              <option value="all">All Types</option>
              <option value="customer_payment">Customer Payments</option>
              <option value="supplier_payment">Supplier Payments</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit">Credit</option>
              <option value="mobile">Mobile</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={`p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                darkMode 
                  ? "bg-gray-700 border-gray-600 focus:border-purple-500 focus:ring-purple-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToExcel}
              className={`px-6 py-4 rounded-2xl font-semibold transition-all ${
                darkMode 
                  ? "bg-green-700 hover:bg-green-600 text-white" 
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              Export Excel 📊
            </motion.button>
          </motion.div>

          {/* Payments Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPayments.map((payment) => (
                <motion.div
                  key={payment._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/80 border-gray-700 hover:border-purple-500" 
                      : "bg-white/80 border-white hover:border-purple-400"
                  } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <motion.h3 
                        className="text-xl font-bold truncate mb-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        {payment.customer_id?.name || "System Payment"}
                      </motion.h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentTypeColor(payment.type, darkMode)}`}>
                          {payment.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                        }`}>
                          {getMethodIcon(payment.method)} {payment.method.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-3xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-purple-100"
                      }`}
                    >
                      {getMethodIcon(payment.method)}
                    </motion.span>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Amount:</span>
                      <span className="text-2xl font-bold text-green-500">${payment.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Date:</span>
                      <span className="font-semibold">{new Date(payment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Time:</span>
                      <span className="font-semibold">{new Date(payment.date).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Processed By:</span>
                      <span className="font-semibold">{payment.user_id?.name || "System"}</span>
                    </div>
                    {payment.customer_id?.phone && (
                      <div className="flex justify-between items-center">
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Customer Phone:</span>
                        <span className="font-semibold">{payment.customer_id.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment ID */}
                  <div className={`text-center p-3 rounded-xl ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <code className="text-sm opacity-75">
                      Ref: {payment._id.slice(-8).toUpperCase()}
                    </code>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredPayments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-2">No payments found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm || typeFilter !== "all" || methodFilter !== "all" || dateFilter !== "all" 
                  ? "Try adjusting your filters" 
                  : "Process your first payment to get started"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;