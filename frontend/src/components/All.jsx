// src/components/All.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { useTheme as useCustomTheme } from "../context/ThemeContext";

const API_URL = "http://localhost:5000/api/dashboard/summary";

// Enhanced color palette for charts
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  emerald: '#10B981'
};

const All = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { darkMode } = useCustomTheme();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(API_URL);
        setSummary(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading Dashboard Data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-red-900">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">{error}</h2>
        <p className="text-gray-600 dark:text-gray-300">Please check your connection and try again</p>
      </div>
    </div>
  );

  const { counts, sales, payments, debts, profit, top_sold, recent_stock_logs } = summary;

  // Enhanced chart data preparations
  const profitLossData = [
    { 
      name: 'Revenue', 
      value: sales.total_revenue, 
      profit: profit.gross_profit,
      type: 'revenue' 
    },
    { 
      name: 'Gross Profit', 
      value: profit.gross_profit, 
      profit: profit.gross_profit,
      type: 'profit' 
    },
    { 
      name: 'Costs', 
      value: payments.supplier_payment || 0, 
      profit: - (payments.supplier_payment || 0),
      type: 'cost' 
    }
  ];

  const salesTrendData = top_sold.slice(0, 8).map((item, index) => ({
    name: item.name?.split(' ').slice(0, 2).join(' ') || `Med ${index + 1}`,
    revenue: item.revenue,
    quantity: item.qty,
    price: item.selling_price || 0
  }));

  const stockDistributionData = [
    { name: 'Normal Stock', value: counts.medicines - counts.low_stock - counts.expired, color: CHART_COLORS.success },
    { name: 'Low Stock', value: counts.low_stock, color: CHART_COLORS.warning },
    { name: 'Expired', value: counts.expired, color: CHART_COLORS.error }
  ];

  const financialMetrics = [
    { label: 'Total Revenue', value: `$${sales.total_revenue.toFixed(2)}`, color: CHART_COLORS.success, icon: '💰' },
    { label: 'Gross Profit', value: `$${profit.gross_profit.toFixed(2)}`, color: CHART_COLORS.primary, icon: '💸' },
    { label: 'Gross Margin', value: `${profit.gross_margin}%`, color: CHART_COLORS.info, icon: '📊' },
    { label: 'Total Sold', value: sales.total_qty.toString(), color: CHART_COLORS.purple, icon: '🛒' }
  ];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600'
          }`}>
            Pharmacy Dashboard
          </h1>
          <p className={`text-lg md:text-xl ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Real-time insights and analytics for your pharmacy
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT SIDE - Stats Cards and Financial Metrics */}
          <div className="xl:col-span-1 space-y-8">
            
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-900 to-indigo-900' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Suppliers</p>
                    <p className="text-3xl font-bold">{counts.suppliers}</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏬</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900 to-emerald-900' 
                  : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Customers</p>
                    <p className="text-3xl font-bold">{counts.customers}</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-yellow-900 to-amber-900' 
                  : 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Medicines</p>
                    <p className="text-3xl font-bold">{counts.medicines}</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">💊</span>
                  </div>
                </div>
              </div>

              <div className={`rounded-2xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-red-900 to-pink-900' 
                  : 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Low Stock</p>
                    <p className="text-3xl font-bold">{counts.low_stock}</p>
                    <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Attention</span>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className={`rounded-2xl p-6 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📈 Financial Overview
              </h3>
              <div className="space-y-4">
                {financialMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{metric.icon}</span>
                      <span className={`font-semibold ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {metric.label}
                      </span>
                    </div>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: metric.color }}
                    >
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Distribution */}
            <div className={`rounded-2xl p-6 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📦 Stock Health
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {stockDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {stockDistributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {item.name}
                      </span>
                    </div>
                    <span className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Charts and Tables */}
          <div className="xl:col-span-2 space-y-8">
            
            {/* Profit & Loss Analysis */}
            <div className={`rounded-2xl p-6 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                💰 Profit & Loss Analysis
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={profitLossData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Amount ($)"
                      fill={CHART_COLORS.primary}
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke={CHART_COLORS.success}
                      strokeWidth={3}
                      name="Profit/Loss ($)"
                      dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Performance Trends */}
            <div className={`rounded-2xl p-6 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                📊 Sales Performance Trends
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={CHART_COLORS.success} 
                      fill={CHART_COLORS.success}
                      fillOpacity={0.3}
                      strokeWidth={3}
                      name="Revenue ($)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quantity" 
                      stroke={CHART_COLORS.info}
                      strokeWidth={2}
                      name="Quantity Sold"
                      dot={{ fill: CHART_COLORS.info, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Medicines */}
            <div className={`rounded-2xl p-6 shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                🏆 Top Selling Medicines
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <th className="text-left p-4 font-semibold">Medicine Name</th>
                      <th className="text-center p-4 font-semibold">Sold</th>
                      <th className="text-center p-4 font-semibold">Price</th>
                      <th className="text-center p-4 font-semibold">Revenue</th>
                      <th className="text-center p-4 font-semibold">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {top_sold.map((item, i) => {
                      const performance = (item.revenue / sales.total_revenue) * 100;
                      return (
                        <tr 
                          key={i} 
                          className={`border-b ${
                            darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                          } transition-colors`}
                        >
                          <td className="p-4 font-medium">{item.name || "Unknown Medicine"}</td>
                          <td className="text-center p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              darkMode 
                                ? 'bg-blue-900 text-blue-200' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.qty}
                            </span>
                          </td>
                          <td className="text-center p-4 font-bold" style={{ color: CHART_COLORS.info }}>
                            ${(item.selling_price || 0).toFixed(2)}
                          </td>
                          <td className="text-center p-4 font-bold" style={{ color: CHART_COLORS.success }}>
                            ${item.revenue.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center space-x-2">
                              <div className={`w-24 h-2 rounded-full ${
                                darkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                <div 
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(performance, 100)}%`,
                                    backgroundColor: 
                                      performance > 20 ? CHART_COLORS.success :
                                      performance > 10 ? CHART_COLORS.warning : CHART_COLORS.error
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold w-12">
                                {performance.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default All;