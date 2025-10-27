import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Debt = () => {
  const { darkMode } = useTheme();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payAmount, setPayAmount] = useState({});
  const [editDebt, setEditDebt] = useState({});
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payingDebt, setPayingDebt] = useState(null);

  // Enhanced alert system
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  // Fetch debts
  useEffect(() => { 
    fetchDebts(); 
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/debts");
      setDebts(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Failed to load debts");
    }
  };

  const handlePayChange = (debtId, value) => {
    setPayAmount(prev => ({ ...prev, [debtId]: value }));
  };

  const payDebt = async (debtId) => {
    const amount = Number(payAmount[debtId]);
    if (!amount || amount <= 0) return showAlert("error", "Enter a valid payment amount");
    if (amount > debts.find(d => d._id === debtId)?.remaining_balance) {
      return showAlert("error", "Payment amount exceeds remaining balance");
    }

    setLoading(true);
    setPayingDebt(debtId);

    try {
      const res = await axios.post(`http://localhost:5000/api/debts/${debtId}/pay`, {
        amount, method: "cash"
      });
      showAlert("success", "Payment processed successfully! 💰");
      setPayAmount(prev => ({ ...prev, [debtId]: "" }));
      fetchDebts();
    } catch (err) {
      console.error(err);
      showAlert("error", err.response?.data?.message || "Payment failed");
    } finally { 
      setLoading(false); 
      setPayingDebt(null);
    }
  };

  const handleEditChange = (debtId, field, value) => {
    setEditDebt(prev => ({ ...prev, [debtId]: { ...prev[debtId], [field]: value } }));
  };

  const updateDebtRecord = async (debtId) => {
    const debtData = editDebt[debtId];
    if (!debtData) return;
    try {
      await axios.put(`http://localhost:5000/api/debts/${debtId}`, debtData);
      showAlert("success", "Debt updated successfully! ✅");
      fetchDebts();
    } catch (err) {
      showAlert("error", "Failed to update debt");
    }
  };

  const deleteDebtRecord = async (debtId) => {
    if (!window.confirm("Are you sure you want to delete this debt record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/debts/${debtId}`);
      showAlert("success", "Debt record deleted successfully! 🗑️");
      fetchDebts();
    } catch (err) {
      showAlert("error", "Failed to delete debt");
    }
  };

  const clearAllDebts = async (debtId) => {
    const debt = debts.find(d => d._id === debtId);
    if (!debt) return;
    
    if (window.confirm(`Clear entire debt of ${debt.remaining_balance} for ${debt.customer_id?.name}?`)) {
      setLoading(true);
      try {
        await axios.post(`http://localhost:5000/api/debts/${debtId}/pay`, {
          amount: debt.remaining_balance,
          method: "cash"
        });
        showAlert("success", "Debt cleared completely! 🎉");
        fetchDebts();
      } catch (err) {
        showAlert("error", "Failed to clear debt");
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter debts
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customer_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.status?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || debt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalDebt = debts.reduce((sum, debt) => sum + debt.remaining_balance, 0);
  const clearedDebts = debts.filter(debt => debt.status === "cleared").length;

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
      case "cleared":
        return darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800";
      case "overdue":
        return darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800";
      default:
        return darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "cleared": return "✅";
      case "overdue": return "⚠️";
      default: return "⏳";
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-red-900/20 text-white" : "bg-gradient-to-br from-red-50 to-orange-100 text-gray-800"}`}>
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
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent mb-4">
              Debt Management
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Track and manage customer payments with precision
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Outstanding</p>
                  <p className="text-3xl font-bold text-red-500">${totalDebt.toFixed(2)}</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Active Debts</p>
                  <p className="text-3xl font-bold text-orange-500">{debts.length}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-2xl backdrop-blur-sm border ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cleared</p>
                  <p className="text-3xl font-bold text-green-500">{clearedDebts}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search by customer name or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all ${
                  darkMode 
                    ? "bg-gray-700 border-gray-600 focus:border-red-500 focus:ring-red-500/20 text-white" 
                    : "bg-white border-gray-200 focus:border-red-500 focus:ring-red-500/20"
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
                  ? "bg-gray-700 border-gray-600 focus:border-red-500 focus:ring-red-500/20 text-white" 
                  : "bg-white border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cleared">Cleared</option>
            </select>
          </motion.div>

          {/* Debt Cards Grid */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredDebts.map((debt) => (
                <motion.div
                  key={debt._id}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/80 border-gray-700 hover:border-red-500" 
                      : "bg-white/80 border-white hover:border-red-400"
                  } transition-all duration-300 hover:shadow-2xl hover:scale-105 group`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <motion.h3 
                        className="text-xl font-bold truncate"
                        whileHover={{ scale: 1.05 }}
                      >
                        {debt.customer_id?.name || "Unknown Customer"}
                      </motion.h3>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(debt.status, darkMode)}`}>
                        {getStatusIcon(debt.status)} {debt.status?.charAt(0).toUpperCase() + debt.status?.slice(1)}
                      </div>
                    </div>
                    <motion.span
                      whileHover={{ rotate: 360 }}
                      className={`text-3xl p-2 rounded-xl ${
                        darkMode ? "bg-gray-700" : "bg-red-100"
                      }`}
                    >
                      💸
                    </motion.span>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Total Owed:</span>
                      <span className="font-bold text-lg">${debt.total_owed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Amount Paid:</span>
                      <span className="font-bold text-green-500">${debt.amount_paid}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Remaining:</span>
                      <span className={`font-bold text-xl ${
                        debt.remaining_balance > 0 ? "text-red-500" : "text-green-500"
                      }`}>
                        ${debt.remaining_balance}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Due Date:</span>
                      <input
                        type="date"
                        value={editDebt[debt._id]?.due_date?.split('T')[0] || new Date(debt.due_date).toISOString().split('T')[0]}
                        onChange={(e) => handleEditChange(debt._id, "due_date", e.target.value)}
                        className={`p-2 rounded-xl border focus:outline-none focus:ring-2 ${
                          darkMode 
                            ? "bg-gray-700 border-gray-600 focus:border-red-500 focus:ring-red-500/20 text-white" 
                            : "bg-white border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {debt.status !== "cleared" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Payment Progress</span>
                        <span>{Math.round((debt.amount_paid / debt.total_owed) * 100)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(debt.amount_paid / debt.total_owed) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-2 rounded-full ${
                            debt.remaining_balance > 0 ? "bg-orange-500" : "bg-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {debt.status !== "cleared" ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <motion.input
                          whileFocus={{ scale: 1.05 }}
                          type="number"
                          min="1"
                          max={debt.remaining_balance}
                          placeholder="Amount"
                          value={payAmount[debt._id] || ""}
                          onChange={(e) => handlePayChange(debt._id, e.target.value)}
                          className={`flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 ${
                            darkMode 
                              ? "bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500/20 text-white" 
                              : "bg-white border-gray-300 focus:border-green-500 focus:ring-green-500/20"
                          }`}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => payDebt(debt._id)}
                          disabled={loading && payingDebt === debt._id}
                          className="px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50"
                        >
                          {loading && payingDebt === debt._id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                            />
                          ) : (
                            "Pay"
                          )}
                        </motion.button>
                      </div>

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => clearAllDebts(debt._id)}
                          className="flex-1 py-2 px-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 text-sm"
                        >
                          Clear All
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateDebtRecord(debt._id)}
                          className="flex-1 py-2 px-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 text-sm"
                        >
                          Update
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => deleteDebtRecord(debt._id)}
                          className="flex-1 py-2 px-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 text-sm"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">🎉</div>
                      <p className={`font-semibold ${darkMode ? "text-green-400" : "text-green-600"}`}>
                        Debt Cleared!
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredDebts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center py-16 rounded-3xl ${
                darkMode ? "bg-gray-800/50" : "bg-white/50"
              }`}
            >
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-2xl font-bold mb-2">No debts found</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "All debts are cleared! 🎉"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Debt;