import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

axios.defaults.baseURL = "http://localhost:5000";

const Report = () => {
  const { darkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    type: "custom",
    include_zero_sales: false
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Safe data access helpers
  const getReportTotals = (report, property) => {
    return report?.totals?.[property] || 0;
  };

  const getMedicineData = (medicine, property) => {
    return medicine?.[property] || 0;
  };

  // Fetch all reports
  const fetchReports = async () => {
    try {
      const { data } = await axios.get("/api/reports");
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Generate new report
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const { data } = await axios.post("/api/reports", form);
      const newReport = data || {};
      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
      setSuccess("Report generated successfully!");
      setLoading(false);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate report");
      setLoading(false);
    }
  };

  // Export functions
  const exportToPDF = () => {
    if (!selectedReport) return;
    alert(`Exporting ${selectedReport.title || 'Report'} as PDF`);
  };

  const exportToExcel = () => {
    if (!selectedReport) return;
    alert(`Exporting ${selectedReport.title || 'Report'} as Excel`);
  };

  const exportToCSV = () => {
    if (!selectedReport) return;
    alert(`Exporting ${selectedReport.title || 'Report'} as CSV`);
  };

  // Format date safely
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Calculate statistics safely
  const calculateStats = () => {
    if (!Array.isArray(reports) || reports.length === 0) {
      return { totalRevenue: 0, totalProfit: 0, totalSold: 0 };
    }

    return reports.reduce((stats, report) => ({
      totalRevenue: stats.totalRevenue + getReportTotals(report, 'total_revenue'),
      totalProfit: stats.totalProfit + getReportTotals(report, 'gross_profit'),
      totalSold: stats.totalSold + getReportTotals(report, 'total_sold_qty')
    }), { totalRevenue: 0, totalProfit: 0, totalSold: 0 });
  };

  const stats = calculateStats();

  // Calculate card colors based on theme
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const cardBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const tableHeaderBg = darkMode ? "bg-gray-700" : "bg-gray-50";
  const tableBorder = darkMode ? "border-gray-600" : "border-gray-300";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const textColor = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-300" : "text-gray-600";

  // Performance color helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "profit":
        return <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">Profit</span>;
      case "loss":
        return <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">Loss</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs font-medium">Break Even</span>;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Pharmacy Sales Analytics
          </h1>
          <p className={`text-lg ${textMuted} max-w-2xl mx-auto`}>
            Comprehensive sales reports with accurate profit/loss analysis based on buying cost
          </p>
        </div>

        {/* Stats Overview */}
        {reports.length > 0 && !selectedReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl font-bold text-blue-500">{reports.length}</div>
              <div className="text-sm font-medium">Total Reports</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm font-medium">Total Revenue</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl font-bold text-purple-500">
                {formatCurrency(stats.totalProfit)}
              </div>
              <div className="text-sm font-medium">Total Profit</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl font-bold text-orange-500">
                {stats.totalSold.toLocaleString()}
              </div>
              <div className="text-sm font-medium">Units Sold</div>
            </div>
          </div>
        )}

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500 text-white rounded-xl shadow-lg">
            <div className="flex items-center">
              <span className="text-lg">⚠️</span>
              <span className="ml-3 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-xl shadow-lg">
            <div className="flex items-center">
              <span className="text-lg">✅</span>
              <span className="ml-3 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Report Generation Form */}
        <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} mb-8`}>
          <div className="flex items-center mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold">Generate New Report</h2>
          </div>
          
          <form className="grid grid-cols-1 lg:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">Start Date</label>
                <input 
                  type="date" 
                  name="startDate" 
                  value={form.startDate} 
                  onChange={handleChange} 
                  className={`w-full p-3 rounded-lg border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                  required 
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">End Date</label>
                <input 
                  type="date" 
                  name="endDate" 
                  value={form.endDate} 
                  onChange={handleChange} 
                  className={`w-full p-3 rounded-lg border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-sm uppercase tracking-wide">Report Type</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  className={`w-full p-3 rounded-lg border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Analysis</option>
                  <option value="monthly">Monthly Overview</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>
              
              <div className="flex items-center p-3 rounded-lg bg-opacity-20 bg-blue-500">
                <input 
                  type="checkbox" 
                  name="include_zero_sales" 
                  checked={form.include_zero_sales} 
                  onChange={handleChange} 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 font-medium">Include medicines with zero sales</span>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating Report...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📊</span>
                    Generate Comprehensive Report
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Reports List Sidebar */}
          {!selectedReport && (
            <div className="xl:col-span-1">
              <div className={`${cardBg} rounded-2xl shadow-lg border ${cardBorder} p-6 sticky top-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Recent Reports</h2>
                  <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                    {reports.length}
                  </span>
                </div>
                
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {reports.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-lg font-medium mb-2">No reports yet</p>
                      <p className={`text-sm ${textMuted}`}>
                        Generate your first report to get started
                      </p>
                    </div>
                  ) : (
                    reports.map((report, index) => (
                      <div 
                        key={report._id || index} 
                        className={`p-4 rounded-lg border ${cardBorder} cursor-pointer transition-all duration-300 ${hoverBg} ${
                          index === 0 ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg truncate">{report.title || 'Untitled Report'}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.type === 'daily' ? 'bg-green-500' :
                            report.type === 'weekly' ? 'bg-blue-500' :
                            report.type === 'monthly' ? 'bg-purple-500' : 'bg-orange-500'
                          } text-white`}>
                            {report.type || 'custom'}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${textMuted}`}>
                          {formatDate(report.period_start)} - {formatDate(report.period_end)}
                        </p>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Revenue: <strong className="text-green-500">{formatCurrency(getReportTotals(report, 'total_revenue'))}</strong></span>
                          <span>Profit: <strong className="text-blue-500">{formatCurrency(getReportTotals(report, 'gross_profit'))}</strong></span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Medicines: <strong>{getReportTotals(report, 'total_medicines_analyzed')}</strong></span>
                          <span>Profitable: <strong className="text-green-500">{getReportTotals(report, 'profitable_medicines')}</strong></span>
                          <span>Loss: <strong className="text-red-500">{getReportTotals(report, 'loss_medicines')}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Report Details */}
          <div className={selectedReport ? "xl:col-span-3" : "xl:col-span-2"}>
            {!selectedReport ? (
              /* Welcome/Empty State */
              <div className={`${cardBg} rounded-2xl shadow-lg border ${cardBorder} p-12 text-center`}>
                <div className="max-w-2xl mx-auto">
                  <div className="text-8xl mb-8">🎯</div>
                  <h2 className="text-3xl font-bold mb-4">Advanced Pharmacy Analytics</h2>
                  <p className={`text-xl mb-8 ${textMuted}`}>
                    Generate comprehensive reports with accurate profit/loss calculations based on buying cost vs sales revenue.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 rounded-xl bg-blue-500 bg-opacity-10 border border-blue-500">
                      <div className="text-3xl mb-4">💊</div>
                      <h3 className="font-bold mb-2">Buying Cost Based</h3>
                      <p className="text-sm">Profit = Revenue - (Buying Price × Current Stock)</p>
                    </div>
                    <div className="p-6 rounded-xl bg-green-500 bg-opacity-10 border border-green-500">
                      <div className="text-3xl mb-4">💰</div>
                      <h3 className="font-bold mb-2">Accurate Profit</h3>
                      <p className="text-sm">Real profit calculation based on actual buying cost</p>
                    </div>
                    <div className="p-6 rounded-xl bg-purple-500 bg-opacity-10 border border-purple-500">
                      <div className="text-3xl mb-4">📈</div>
                      <h3 className="font-bold mb-2">Performance Insights</h3>
                      <p className="text-sm">Medicine-level performance with recommendations</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Report Detail View */
              <div className={`${cardBg} rounded-2xl shadow-lg border ${cardBorder} p-6`}>
                {/* Report Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                  <div>
                    <button 
                      onClick={() => setSelectedReport(null)}
                      className="flex items-center text-blue-500 hover:text-blue-400 mb-4 lg:mb-0 transition-colors duration-300"
                    >
                      <span className="mr-2">←</span>
                      Back to All Reports
                    </button>
                    <h2 className="text-3xl font-bold mt-2">{selectedReport.title || 'Report Details'}</h2>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReport.type === 'daily' ? 'bg-green-500' :
                        selectedReport.type === 'weekly' ? 'bg-blue-500' :
                        selectedReport.type === 'monthly' ? 'bg-purple-500' : 'bg-orange-500'
                      } text-white`}>
                        {(selectedReport.type || 'custom').charAt(0).toUpperCase() + (selectedReport.type || 'custom').slice(1)} Report
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        Period: {formatDate(selectedReport.period_start)} - {formatDate(selectedReport.period_end)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReport.executive_summary?.overall_performance === 'Excellent' ? 'bg-green-500' :
                        selectedReport.executive_summary?.overall_performance === 'Good' ? 'bg-blue-500' :
                        selectedReport.executive_summary?.overall_performance === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                      } text-white`}>
                        {selectedReport.executive_summary?.overall_performance || 'Unknown'} Performance
                      </span>
                    </div>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                    <button 
                      onClick={exportToPDF}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📄</span>
                      PDF
                    </button>
                    <button 
                      onClick={exportToExcel}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📊</span>
                      Excel
                    </button>
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📋</span>
                      CSV
                    </button>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-600 mb-6">
                  <button
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "summary"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("summary")}
                  >
                    📊 Executive Summary
                  </button>
                  <button
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "medicines"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("medicines")}
                  >
                    💊 Medicine Details
                  </button>
                  <button
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                      activeTab === "categories"
                        ? "border-blue-500 text-blue-500"
                        : "border-transparent text-gray-500 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("categories")}
                  >
                    📁 Categories
                  </button>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(getReportTotals(selectedReport, 'total_revenue'))}</div>
                    <div className="text-sm font-medium">Total Revenue</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-blue-500">{formatCurrency(getReportTotals(selectedReport, 'gross_profit'))}</div>
                    <div className="text-sm font-medium">Gross Profit</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-purple-500">
                      {getReportTotals(selectedReport, 'gross_margin')?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-sm font-medium">Profit Margin</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-orange-500">{getReportTotals(selectedReport, 'total_sold_qty')}</div>
                    <div className="text-sm font-medium">Units Sold</div>
                  </div>
                </div>

                {/* Performance Distribution */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-gray-500">{getReportTotals(selectedReport, 'total_medicines_analyzed')}</div>
                    <div className="text-sm font-medium">Total Medicines</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-green-500">{getReportTotals(selectedReport, 'profitable_medicines')}</div>
                    <div className="text-sm font-medium">Profitable</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-red-500">{getReportTotals(selectedReport, 'loss_medicines')}</div>
                    <div className="text-sm font-medium">Loss Making</div>
                  </div>
                  <div className={`p-4 rounded-lg border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-yellow-500">
                      {getReportTotals(selectedReport, 'total_medicines_analyzed') - 
                       getReportTotals(selectedReport, 'profitable_medicines') - 
                       getReportTotals(selectedReport, 'loss_medicines')}
                    </div>
                    <div className="text-sm font-medium">Break Even</div>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    {/* Executive Summary */}
                    <div className={`p-6 rounded-lg border ${cardBorder}`}>
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                        Executive Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-bold mb-3 text-green-500">Key Insights</h4>
                          <ul className="space-y-2">
                            {(selectedReport.executive_summary?.key_insights || []).map((insight, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold mb-3 text-blue-500">Overall Performance</h4>
                          <p className={`text-2xl font-bold ${
                            selectedReport.executive_summary?.overall_performance === 'Excellent' ? 'text-green-500' :
                            selectedReport.executive_summary?.overall_performance === 'Good' ? 'text-blue-500' :
                            selectedReport.executive_summary?.overall_performance === 'Fair' ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {selectedReport.executive_summary?.overall_performance || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Based on profit margin of {getReportTotals(selectedReport, 'gross_margin')?.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top Performers */}
                    {(selectedReport.executive_summary?.top_performers || []).length > 0 && (
                      <div className={`p-6 rounded-lg border ${cardBorder}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                          Top Performing Medicines
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${tableHeaderBg} border-b ${tableBorder}`}>
                                <th className="px-4 py-3 text-left font-semibold">Medicine</th>
                                <th className="px-4 py-3 text-left font-semibold">Profit</th>
                                <th className="px-4 py-3 text-left font-semibold">Margin</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedReport.executive_summary.top_performers.map((medicine, index) => (
                                <tr key={index} className={`border-b ${tableBorder} ${hoverBg}`}>
                                  <td className="px-4 py-3 font-medium">{medicine.name}</td>
                                  <td className="px-4 py-3 text-green-500 font-medium">{formatCurrency(medicine.profit)}</td>
                                  <td className="px-4 py-3">{medicine.margin?.toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Areas of Concern */}
                    {(selectedReport.executive_summary?.areas_of_concern || []).length > 0 && (
                      <div className={`p-6 rounded-lg border ${cardBorder}`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                          <span className="w-2 h-6 bg-red-500 rounded-full mr-3"></span>
                          Areas Requiring Attention
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className={`${tableHeaderBg} border-b ${tableBorder}`}>
                                <th className="px-4 py-3 text-left font-semibold">Medicine</th>
                                <th className="px-4 py-3 text-left font-semibold">Loss</th>
                                <th className="px-4 py-3 text-left font-semibold">Margin</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedReport.executive_summary.areas_of_concern.map((medicine, index) => (
                                <tr key={index} className={`border-b ${tableBorder} ${hoverBg}`}>
                                  <td className="px-4 py-3 font-medium">{medicine.name}</td>
                                  <td className="px-4 py-3 text-red-500 font-medium">{formatCurrency(medicine.loss)}</td>
                                  <td className="px-4 py-3">{medicine.margin?.toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "medicines" && (
                  <div className="overflow-hidden rounded-lg border ${cardBorder}">
                    <div className={`p-4 ${tableHeaderBg} border-b ${tableBorder}`}>
                      <h3 className="text-xl font-bold flex items-center">
                        <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                        Medicine Performance Details
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Profit Calculation: Total Revenue - (Buying Price × Current Stock)
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${tableHeaderBg} border-b ${tableBorder}`}>
                            {[
                              "Medicine", "Category", "Current Stock", "Sold Qty", "Remaining Stock",
                              "Buying Price", "Selling Price", "Total Revenue", 
                              "Buying Cost", "Profit/Loss", "Margin", "Performance", "Status", "Recommendation"
                            ].map((header, index) => (
                              <th 
                                key={index} 
                                className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedReport.by_medicine || []).map((medicine, index) => (
                            <tr 
                              key={medicine.medicine_id || index} 
                              className={`border-b ${tableBorder} transition-colors duration-300 ${hoverBg} ${
                                medicine.status === 'loss' ? 'bg-red-500 bg-opacity-10' : ''
                              }`}
                            >
                              <td className="px-4 py-3 font-medium">{medicine.name || 'Unknown Medicine'}</td>
                              <td className="px-4 py-3 text-sm">{medicine.category_name || 'Uncategorized'}</td>
                              <td className="px-4 py-3">{getMedicineData(medicine, 'quantity_in_stock')}</td>
                              <td className="px-4 py-3 font-medium">{getMedicineData(medicine, 'sold_qty')}</td>
                              <td className="px-4 py-3">{getMedicineData(medicine, 'remaining_stock')}</td>
                              <td className="px-4 py-3">{formatCurrency(getMedicineData(medicine, 'buying_price'))}</td>
                              <td className="px-4 py-3">{formatCurrency(getMedicineData(medicine, 'medicine_price'))}</td>
                              <td className="px-4 py-3 text-green-500 font-medium">{formatCurrency(getMedicineData(medicine, 'sold_revenue'))}</td>
                              <td className="px-4 py-3">{formatCurrency(getMedicineData(medicine, 'total_buying_cost'))}</td>
                              <td className={`px-4 py-3 font-medium ${
                                getMedicineData(medicine, 'profit') >= 0 ? 'text-blue-500' : 'text-red-500'
                              }`}>
                                {formatCurrency(getMedicineData(medicine, 'profit'))}
                              </td>
                              <td className="px-4 py-3">{getMedicineData(medicine, 'profit_margin')?.toFixed(1)}%</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  medicine.performance === 'excellent' ? 'bg-green-500' :
                                  medicine.performance === 'good' ? 'bg-blue-500' :
                                  medicine.performance === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                                } text-white`}>
                                  {medicine.performance}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(medicine.status)}
                              </td>
                              <td className="px-4 py-3 text-sm max-w-xs">
                                {medicine.recommendation}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "categories" && (
                  <div className="overflow-hidden rounded-lg border ${cardBorder}">
                    <div className={`p-4 ${tableHeaderBg} border-b ${tableBorder}`}>
                      <h3 className="text-xl font-bold flex items-center">
                        <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                        Category Performance Summary
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${tableHeaderBg} border-b ${tableBorder}`}>
                            {[
                              "Category", "Sold Qty", "Revenue", "Buying Cost", "Profit", "Margin", "Status"
                            ].map((header, index) => (
                              <th 
                                key={index} 
                                className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedReport.by_category || []).map((category, index) => (
                            <tr 
                              key={category.category_id || index} 
                              className={`border-b ${tableBorder} transition-colors duration-300 ${hoverBg}`}
                            >
                              <td className="px-4 py-3 font-medium">{category.name || 'Uncategorized'}</td>
                              <td className="px-4 py-3 font-medium">{category.sold_qty}</td>
                              <td className="px-4 py-3 text-green-500 font-medium">{formatCurrency(category.sold_revenue)}</td>
                              <td className="px-4 py-3">{formatCurrency(category.total_medicine_cost)}</td>
                              <td className={`px-4 py-3 font-medium ${
                                category.gross_profit >= 0 ? 'text-blue-500' : 'text-red-500'
                              }`}>
                                {formatCurrency(category.gross_profit)}
                              </td>
                              <td className="px-4 py-3">{category.profit_margin?.toFixed(1)}%</td>
                              <td className="px-4 py-3">
                                {getStatusBadge(category.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Summary Footer */}
                <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <p className="text-sm">
                    Report generated on {formatDate(selectedReport.generated_at)} • 
                    {(selectedReport.by_medicine || []).length} medicines analyzed • 
                    Overall profit margin: {(getReportTotals(selectedReport, 'gross_margin') || 0).toFixed(1)}% • 
                    {getReportTotals(selectedReport, 'profitable_medicines')} profitable • 
                    {getReportTotals(selectedReport, 'loss_medicines')} loss-making
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;