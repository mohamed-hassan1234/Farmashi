import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

axios.defaults.baseURL = "http://localhost:5000";

const Report = () => {
  const { darkMode } = useTheme();
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
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
      setError("Failed to generate report");
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Pharmacy Analytics Dashboard
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Generate comprehensive sales reports, track inventory performance, and analyze profitability with beautiful visual insights.
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
                ${stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm font-medium">Total Revenue</div>
            </div>
            <div className={`${cardBg} rounded-2xl p-6 shadow-lg border ${cardBorder} transform hover:scale-105 transition-transform duration-300`}>
              <div className="text-2xl font-bold text-purple-500">
                ${stats.totalProfit.toLocaleString()}
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
          <div className="mb-6 p-4 bg-red-500 text-white rounded-xl shadow-lg transform animate-pulse">
            <div className="flex items-center">
              <span className="text-lg">⚠️</span>
              <span className="ml-3 font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500 text-white rounded-xl shadow-lg transform animate-bounce">
            <div className="flex items-center">
              <span className="text-lg">✅</span>
              <span className="ml-3 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Report Generation Form */}
        <div className={`${cardBg} rounded-2xl p-6 shadow-2xl border ${cardBorder} mb-8 transition-all duration-300 hover:shadow-xl`}>
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
                  className={`w-full p-4 rounded-xl border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
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
                  className={`w-full p-4 rounded-xl border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
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
                  className={`w-full p-4 rounded-xl border ${cardBorder} transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
                >
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Analysis</option>
                  <option value="monthly">Monthly Overview</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>
              
              <div className="flex items-center p-4 rounded-xl bg-opacity-20 bg-blue-500">
                <input 
                  type="checkbox" 
                  name="include_zero_sales" 
                  checked={form.include_zero_sales} 
                  onChange={handleChange} 
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 font-medium">Include medicines with zero sales</span>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Generating Your Report...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="mr-2">📊</span>
                    Generate Insightful Report
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
              <div className={`${cardBg} rounded-2xl shadow-2xl border ${cardBorder} p-6 sticky top-6`}>
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
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Generate your first report to get started
                      </p>
                    </div>
                  ) : (
                    reports.map((report, index) => (
                      <div 
                        key={report._id || index} 
                        className={`p-4 rounded-xl border ${cardBorder} cursor-pointer transition-all duration-300 transform hover:scale-105 ${hoverBg} ${
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
                        <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(report.period_start)} - {formatDate(report.period_end)}
                        </p>
                        <div className="flex justify-between text-sm">
                          <span>Revenue: <strong className="text-green-500">${getReportTotals(report, 'total_revenue')}</strong></span>
                          <span>Profit: <strong className="text-blue-500">${getReportTotals(report, 'gross_profit')}</strong></span>
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
              <div className={`${cardBg} rounded-2xl shadow-2xl border ${cardBorder} p-12 text-center`}>
                <div className="max-w-2xl mx-auto">
                  <div className="text-8xl mb-8">🎯</div>
                  <h2 className="text-3xl font-bold mb-4">Welcome to Your Pharmacy Analytics</h2>
                  <p className={`text-xl mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Generate comprehensive reports to track sales performance, inventory movement, and business profitability. Make data-driven decisions with beautiful insights.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 rounded-xl bg-blue-500 bg-opacity-10 border border-blue-500">
                      <div className="text-3xl mb-4">📈</div>
                      <h3 className="font-bold mb-2">Sales Tracking</h3>
                      <p className="text-sm">Monitor revenue and sales patterns over time</p>
                    </div>
                    <div className="p-6 rounded-xl bg-green-500 bg-opacity-10 border border-green-500">
                      <div className="text-3xl mb-4">💊</div>
                      <h3 className="font-bold mb-2">Inventory Insights</h3>
                      <p className="text-sm">Track stock levels and medicine performance</p>
                    </div>
                    <div className="p-6 rounded-xl bg-purple-500 bg-opacity-10 border border-purple-500">
                      <div className="text-3xl mb-4">💰</div>
                      <h3 className="font-bold mb-2">Profit Analysis</h3>
                      <p className="text-sm">Understand your margins and profitability</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Report Detail View */
              <div className={`${cardBg} rounded-2xl shadow-2xl border ${cardBorder} p-8`}>
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
                    </div>
                  </div>
                  
                  {/* Export Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
                    <button 
                      onClick={exportToPDF}
                      className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📄</span>
                      PDF
                    </button>
                    <button 
                      onClick={exportToExcel}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📊</span>
                      Excel
                    </button>
                    <button 
                      onClick={exportToCSV}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-300"
                    >
                      <span className="mr-2">📋</span>
                      CSV
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className={`p-4 rounded-xl border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-green-500">${getReportTotals(selectedReport, 'total_revenue')}</div>
                    <div className="text-sm font-medium">Total Revenue</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-blue-500">${getReportTotals(selectedReport, 'gross_profit')}</div>
                    <div className="text-sm font-medium">Gross Profit</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-purple-500">
                      {getReportTotals(selectedReport, 'gross_margin')?.toFixed(1) || '0.0'}%
                    </div>
                    <div className="text-sm font-medium">Profit Margin</div>
                  </div>
                  <div className={`p-4 rounded-xl border ${cardBorder} text-center`}>
                    <div className="text-2xl font-bold text-orange-500">{getReportTotals(selectedReport, 'total_sold_qty')}</div>
                    <div className="text-sm font-medium">Units Sold</div>
                  </div>
                </div>

                {/* Detailed Totals */}
                <div className={`rounded-xl border ${cardBorder} p-6 mb-8`}>
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Total Purchased Qty", value: getReportTotals(selectedReport, 'total_purchased_qty'), icon: "📦" },
                      { label: "Total Purchased Cost", value: `$${getReportTotals(selectedReport, 'total_purchased_cost')}`, icon: "💳" },
                      { label: "Total Sold Qty", value: getReportTotals(selectedReport, 'total_sold_qty'), icon: "🛒" },
                      { label: "Total Revenue", value: `$${getReportTotals(selectedReport, 'total_revenue')}`, icon: "💰" },
                      { label: "Total COGS", value: `$${getReportTotals(selectedReport, 'total_cogs')}`, icon: "📊" },
                      { label: "Gross Profit", value: `$${getReportTotals(selectedReport, 'gross_profit')}`, icon: "🎯" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center p-3 rounded-lg bg-opacity-20 bg-blue-500">
                        <span className="text-2xl mr-3">{item.icon}</span>
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-lg font-bold">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medicine Details Table */}
                <div className="overflow-hidden rounded-xl border ${cardBorder}">
                  <div className={`p-4 ${tableHeaderBg} border-b ${tableBorder}`}>
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                      Medicine Performance Details
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`${tableHeaderBg} border-b ${tableBorder}`}>
                          {[
                            "Medicine", "Opening Stock", "Purchased", "Sold", 
                            "Revenue", "Profit", "Closing Stock", "Status"
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
                              medicine.is_loss ? 'bg-red-500 bg-opacity-10' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-medium">{medicine.name || 'Unknown Medicine'}</td>
                            <td className="px-4 py-3">{getMedicineData(medicine, 'opening_stock')}</td>
                            <td className="px-4 py-3">{getMedicineData(medicine, 'purchased_qty')}</td>
                            <td className="px-4 py-3 font-medium">{getMedicineData(medicine, 'sold_qty')}</td>
                            <td className="px-4 py-3 text-green-500 font-medium">${getMedicineData(medicine, 'sold_revenue')}</td>
                            <td className={`px-4 py-3 font-medium ${
                              getMedicineData(medicine, 'gross_profit') >= 0 ? 'text-blue-500' : 'text-red-500'
                            }`}>
                              ${getMedicineData(medicine, 'gross_profit')}
                            </td>
                            <td className="px-4 py-3">{getMedicineData(medicine, 'closing_stock')}</td>
                            <td className="px-4 py-3">
                              {medicine.is_loss ? (
                                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
                                  Loss
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                                  Profit
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Footer */}
                <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
                  <p className="text-sm">
                    Report generated on {new Date().toLocaleDateString()} • 
                    {(selectedReport.by_medicine || []).length} medicines analyzed • 
                    Gross margin: {(getReportTotals(selectedReport, 'gross_margin') || 0).toFixed(2)}%
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