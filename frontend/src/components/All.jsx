import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

// Import Chart.js components directly
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { darkMode } = useTheme();
  const [data, setData] = useState({});
  const [timeRange, setTimeRange] = useState("monthly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/dashboard?range=${timeRange}`);
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      // Fallback data for demonstration
      setData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for demonstration
  const getFallbackData = () => {
    const baseData = {
      totalRevenue: 125000,
      netProfit: 45000,
      totalExpenses: 80000,
      activeCustomers: 156,
      medicineCount: 89,
      lowStockCount: 12,
      pendingPayments: 8,
      totalSales: 234,
      totalDebt: 15000,
      debtPaid: 8500,
      debtPending: 4500,
      debtOverdue: 2000,
      revenueGrowth: 12.5,
      profitGrowth: 8.3,
      customerGrowth: 5.2,
      cashSales: 189,
      creditSales: 45,
      inStockCount: 65,
      outOfStockCount: 12
    };

    // Generate realistic trend data
    const labels = generateLabels(timeRange);
    baseData.profitLossTrend = {
      labels,
      profit: labels.map(() => Math.random() * 10000 + 20000),
      loss: labels.map(() => Math.random() * 5000)
    };
    
    baseData.revenueTrend = {
      labels,
      data: labels.map(() => Math.random() * 30000 + 80000)
    };

    baseData.lowStock = [
      { _id: "1", name: "Paracetamol 500mg", quantity_in_stock: 3, supplier_id: { name: "MediSupplies Inc" } },
      { _id: "2", name: "Amoxicillin 250mg", quantity_in_stock: 5, supplier_id: { name: "PharmaDistro Ltd" } },
      { _id: "3", name: "Vitamin C 1000mg", quantity_in_stock: 2, supplier_id: { name: "HealthSupplies Co" } },
      { _id: "4", name: "Ibuprofen 400mg", quantity_in_stock: 0, supplier_id: { name: "MediSupplies Inc" } }
    ];

    return baseData;
  };

  const generateLabels = (range) => {
    switch (range) {
      case 'daily':
        return ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'];
      case 'weekly':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'monthly':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      case 'yearly':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    }
  };

  // Chart data configurations
  const profitLossChart = {
    labels: data.profitLossTrend?.labels || [],
    datasets: [
      {
        label: "Profit",
        data: data.profitLossTrend?.profit || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: "Loss",
        data: data.profitLossTrend?.loss || [],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }
    ]
  };

  const revenueChart = {
    labels: data.revenueTrend?.labels || [],
    datasets: [
      {
        label: "Revenue",
        data: data.revenueTrend?.data || [],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }
    ]
  };

  const salesDistribution = {
    labels: ["Cash Sales", "Credit Sales", "Pending Payments"],
    datasets: [
      {
        data: [
          data.cashSales || 0,
          data.creditSales || 0,
          data.pendingPayments || 0
        ],
        backgroundColor: [
          "#10B981",
          "#F59E0B",
          "#EF4444"
        ],
        hoverBackgroundColor: [
          "#059669",
          "#D97706",
          "#DC2626"
        ],
        borderWidth: 2,
        borderColor: darkMode ? "#1F2937" : "#FFFFFF"
      }
    ]
  };

  const stockStatus = {
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    datasets: [
      {
        data: [
          data.inStockCount || 0,
          data.lowStockCount || 0,
          data.outOfStockCount || 0
        ],
        backgroundColor: [
          "#10B981",
          "#F59E0B",
          "#EF4444"
        ],
        hoverBackgroundColor: [
          "#059669",
          "#D97706",
          "#DC2626"
        ],
        borderWidth: 2,
        borderColor: darkMode ? "#1F2937" : "#FFFFFF"
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#E5E7EB' : '#374151',
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        titleColor: darkMode ? '#E5E7EB' : '#374151',
        bodyColor: darkMode ? '#E5E7EB' : '#374151',
        borderColor: darkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
          font: {
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          drawBorder: false
        },
        ticks: {
          color: darkMode ? '#9CA3AF' : '#6B7280',
          font: {
            family: "'Inter', sans-serif"
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear'
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#E5E7EB' : '#374151',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        titleColor: darkMode ? '#E5E7EB' : '#374151',
        bodyColor: darkMode ? '#E5E7EB' : '#374151',
        borderColor: darkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

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
        stiffness: 100,
        damping: 12
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
        stiffness: 100,
        damping: 12
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 border-4 ${darkMode ? 'border-blue-500 border-t-transparent' : 'border-blue-600 border-t-transparent'} rounded-full mx-auto mb-4`}
          />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "bg-gradient-to-br from-gray-900 to-blue-900/20" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
              Pharmacy Analytics
            </h1>
            <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"} mb-6`}>
              Complete Business Intelligence Dashboard
            </p>
            
            {/* Time Range Selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {["daily", "weekly", "monthly", "yearly"].map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range)}
                  className={`px-5 py-2.5 rounded-xl font-semibold capitalize transition-all border-2 ${
                    timeRange === range
                      ? darkMode 
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                        : "bg-blue-500 border-blue-400 text-white shadow-lg"
                      : darkMode 
                        ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" 
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <motion.div variants={cardVariants} className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Revenue</p>
                  <p className="text-3xl font-bold text-green-500 mb-2">${data.totalRevenue?.toLocaleString() || "0"}</p>
                  <p className={`text-sm ${data.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    <span className="text-lg mr-1">{data.revenueGrowth >= 0 ? '↗' : '↘'}</span>
                    {Math.abs(data.revenueGrowth || 0)}% from last period
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-4xl bg-green-500/20 p-3 rounded-2xl"
                >
                  💰
                </motion.div>
              </div>
            </motion.div>

            {/* Total Profit */}
            <motion.div variants={cardVariants} className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Net Profit</p>
                  <p className={`text-3xl font-bold mb-2 ${(data.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${Math.abs(data.netProfit || 0).toLocaleString()} 
                    <span className="text-lg ml-2">{(data.netProfit || 0) >= 0 ? '' : 'Loss'}</span>
                  </p>
                  <p className={`text-sm ${(data.profitGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    <span className="text-lg mr-1">{data.profitGrowth >= 0 ? '↗' : '↘'}</span>
                    {Math.abs(data.profitGrowth || 0)}%
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`text-4xl p-3 rounded-2xl ${(data.netProfit || 0) >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}
                >
                  📈
                </motion.div>
              </div>
            </motion.div>

            {/* Total Expenses */}
            <motion.div variants={cardVariants} className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total Expenses</p>
                  <p className="text-3xl font-bold text-orange-500 mb-2">${data.totalExpenses?.toLocaleString() || "0"}</p>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Purchases & Operations
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-4xl bg-orange-500/20 p-3 rounded-2xl"
                >
                  💸
                </motion.div>
              </div>
            </motion.div>

            {/* Active Customers */}
            <motion.div variants={cardVariants} className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
              darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Active Customers</p>
                  <p className="text-3xl font-bold text-blue-500 mb-2">{data.activeCustomers?.toLocaleString() || "0"}</p>
                  <p className={`text-sm text-green-500 flex items-center`}>
                    <span className="text-lg mr-1">↗</span>
                    {data.customerGrowth || 0}% growth
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-4xl bg-blue-500/20 p-3 rounded-2xl"
                >
                  👥
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Charts Grid */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Profit & Loss Trend */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? "bg-green-900/50" : "bg-green-100"
                }`}>
                  📊
                </span>
                Profit & Loss Trend
              </h3>
              <div className="h-80">
                <Line data={profitLossChart} options={lineChartOptions} />
              </div>
            </motion.div>

            {/* Revenue Trend */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? "bg-blue-900/50" : "bg-blue-100"
                }`}>
                  💰
                </span>
                Revenue Trend
              </h3>
              <div className="h-80">
                <Line data={revenueChart} options={lineChartOptions} />
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Charts Row */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sales Distribution */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Sales Distribution</h3>
              <div className="h-64">
                <Doughnut data={salesDistribution} options={doughnutOptions} />
              </div>
            </motion.div>

            {/* Stock Status */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Stock Status</h3>
              <div className="h-64">
                <Pie data={stockStatus} options={doughnutOptions} />
              </div>
            </motion.div>

            {/* Debt Overview */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className={`p-2 rounded-lg mr-3 ${
                  darkMode ? "bg-red-900/50" : "bg-red-100"
                }`}>
                  🏦
                </span>
                Debt Overview
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/10">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Total Debt:</span>
                  <span className="text-xl font-bold text-red-500">${data.totalDebt?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-green-500/10">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Paid:</span>
                  <span className="text-lg font-semibold text-green-500">${data.debtPaid?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-500/10">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Pending:</span>
                  <span className="text-lg font-semibold text-yellow-500">${data.debtPending?.toLocaleString() || "0"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-red-500/10">
                  <span className={darkMode ? "text-gray-300" : "text-gray-600"}>Overdue:</span>
                  <span className="text-lg font-semibold text-red-500">${data.debtOverdue?.toLocaleString() || "0"}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              variants={cardVariants}
              className={`rounded-3xl p-6 shadow-2xl backdrop-blur-sm border-2 ${
                darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-white"
              }`}
            >
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { label: "Add New Medicine", icon: "💊", action: () => window.location.href = "/medicines" },
                  { label: "Process Sale", icon: "🛒", action: () => window.location.href = "/sales" },
                  { label: "View Reports", icon: "📋", action: () => window.location.href = "/reports" },
                  { label: "Manage Stock", icon: "📦", action: () => window.location.href = "/purchases" }
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.action}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center ${
                      darkMode 
                        ? "bg-gray-700 hover:bg-gray-600 text-white" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <span className="text-xl mr-3">{action.icon}</span>
                    <span className="font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Low Stock Alert */}
          {data.lowStock?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 rounded-3xl p-6 shadow-2xl border-l-4 border-red-500 ${
                darkMode ? "bg-red-900/20 border-red-700" : "bg-red-50 border-red-200"
              }`}
            >
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                Low Stock Alert - Immediate Attention Required!
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.lowStock.map((medicine, index) => (
                  <motion.div
                    key={medicine._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${
                      medicine.quantity_in_stock === 0
                        ? darkMode ? "bg-red-800/30 border-red-600" : "bg-red-100 border-red-300"
                        : darkMode ? "bg-yellow-800/30 border-yellow-600" : "bg-yellow-100 border-yellow-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-lg">{medicine.name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        medicine.quantity_in_stock === 0
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}>
                        {medicine.quantity_in_stock === 0 ? "OUT OF STOCK" : `Only ${medicine.quantity_in_stock} left`}
                      </span>
                    </div>
                    {medicine.supplier_id?.name && (
                      <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>
                        📞 Supplier: {medicine.supplier_id.name}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;