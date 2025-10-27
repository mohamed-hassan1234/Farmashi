import React, { useState, useEffect } from "react";
import {
  FaHome, FaUser, FaChartBar, FaCog, FaBoxes, FaPills,
  FaShoppingCart, FaMoneyBillWave, FaFileInvoice, FaUserPlus, 
  FaMoon, FaSun, FaBars, FaChevronRight, FaCapsules,
  FaTruck, FaTags, FaPrescriptionBottle, FaReceipt,
  FaDollarSign, FaHandHoldingUsd, FaFileAlt, FaUsers
} from "react-icons/fa";
import Supplier from "../components/Supplier";
import Category from "../components/Category";
import Medicine from "../components/Medicine";
import Purchase from "../components/Purchase";
import PurchaseInvoice from "../components/PurchaseItem";
import Customer from "../components/Customer";
import Sale from "../components/Sale";
import Debt from "../components/Debt";
import Payment from "../components/Payment";
import FullReport from "../components/Report";
import { useTheme } from "../context/ThemeContext";
import All from "../components/All";

const Dashboard = () => {
  const [activeMenu, setActiveMenu] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Proper menu items with correct icons
  const menuItems = [
    { key: "home", label: "Dashboard", icon: <FaHome />, component: "home" },
    { key: "suppliers", label: "Suppliers", icon: <FaTruck />, component: "suppliers" },
    { key: "categories", label: "Categories", icon: <FaTags />, component: "categories" },
    { key: "medicines", label: "Medicines", icon: <FaPills />, component: "medicines" },
    { key: "purchases", label: "Purchases", icon: <FaShoppingCart />, component: "purchases" },
    // { key: "purchase-items", label: "Purchase Items", icon: <FaReceipt />, component: "purchase-items" },
    { key: "sales", label: "Sales", icon: <FaMoneyBillWave />, component: "sales" },
    { key: "customers", label: "Customers", icon: <FaUsers />, component: "customers" },
    { key: "payments", label: "Payments", icon: <FaDollarSign />, component: "payments" },
    { key: "debts", label: "Debts", icon: <FaHandHoldingUsd />, component: "debts" },
    { key: "reports", label: "Reports", icon: <FaChartBar />, component: "reports" },
    { key: "settings", label: "Settings", icon: <FaCog />, component: "settings" },
  ];

  const renderContent = () => {
    const currentMenuItem = menuItems.find(item => item.key === activeMenu);
    
    switch (activeMenu) {
      case "home":
        return (
          // <div className={`min-h-full ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
          //   <div className="p-6">
          //     {/* Welcome Header with Animation */}
          //     <div className="mb-8 animate-fade-in-up">
          //       <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
          //         Welcome to Al-Ikhlaas Pharmacy
          //       </h1>
          //       <p className={`text-xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          //         Excellence in Healthcare Management
          //       </p>
          //     </div>

          //     {/* Stats Grid */}
          //     {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          //       {[
          //         { title: "Total Medicines", value: "1,234", color: "from-green-500 to-emerald-600", icon: <FaPills /> },
          //         { title: "Today's Sales", value: "$12,456", color: "from-blue-500 to-cyan-600", icon: <FaMoneyBillWave /> },
          //         { title: "Pending Orders", value: "23", color: "from-orange-500 to-red-600", icon: <FaShoppingCart /> },
          //         { title: "Active Customers", value: "456", color: "from-purple-500 to-pink-600", icon: <FaUsers /> },
          //       ].map((stat, index) => (
          //         <div 
          //           key={stat.title}
          //           className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-2xl transform hover:scale-105 transition-all duration-300 animate-slide-in-up`}
          //           style={{ animationDelay: `${index * 100}ms` }}
          //         >
          //           <div className="flex justify-between items-start">
          //             <div>
          //               <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
          //               <p className="text-3xl font-bold">{stat.value}</p>
          //             </div>
          //             <div className="text-2xl opacity-80">
          //               {stat.icon}
          //             </div>
          //           </div>
          //         </div>
          //       ))}
          //     </div> */}

          //     {/* Quick Actions */}
          //     <div className={`rounded-2xl p-8 shadow-xl ${
          //       darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          //     }`}>
          //       <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          //       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          //         {menuItems.slice(1, 9).map((item) => (
          //           <button
          //             key={item.key}
          //             onClick={() => setActiveMenu(item.key)}
          //             className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 ${
          //               darkMode 
          //                 ? "bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-blue-500 text-white" 
          //                 : "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-500 text-gray-700 shadow-lg"
          //             }`}
          //           >
          //             <span className="text-3xl mb-3 text-blue-500">{item.icon}</span>
          //             <span className="text-sm font-medium text-center">{item.label}</span>
          //           </button>
          //         ))}
          //       </div>
          //     </div>
          //   </div>
          // </div>
          <All/>
        );
      
      case "suppliers": return <Supplier />;
      case "categories": return <Category />;
      case "medicines": return <Medicine />;
      case "purchases": return <Purchase />;
      // case "purchase-items": return <PurchaseInvoice />;
      case "sales": return <Sale />;
      case "customers": return <Customer />;
      case "payments": return <Payment />;
      case "debts": return <Debt />;
      case "reports": return <FullReport />;
      case "settings":
        return (
          <div className={`min-h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800" : "bg-white shadow-lg"}`}>
              <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Configure your dashboard preferences and system settings.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className={`min-h-full p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <h1 className="text-3xl font-bold mb-4">{currentMenuItem?.label}</h1>
            <div className={`rounded-2xl p-6 ${darkMode ? "bg-gray-800" : "bg-white shadow-lg"}`}>
              <p>Content for {currentMenuItem?.label} will be displayed here.</p>
            </div>
          </div>
        );
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className={`flex  h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
    <div
  className={`fixed md:relative z-50 h-full top-0 left-0 
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    ${collapsed ? "w-20" : "w-64"} 
    ${
      darkMode
        ? "bg-gray-800 text-white border-r border-gray-700"
        : "bg-white text-black border-r border-gray-200"
    }
    shadow-xl flex flex-col transition-all duration-300`}
>

        
        {/* Header with Logo and Toggle */}
        <div className={`p-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <div className={`flex items-center justify-between ${collapsed ? "flex-col space-y-4" : ""}`}>
            {!collapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaCapsules className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Al-Ikhlaas
                  </h1>
                  <p className="text-xs text-gray-500">Pharmacy</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600 text-yellow-400" 
                    : "bg-blue-100 hover:bg-blue-200 text-gray-700"
                }`}
                title="Toggle Dark Mode"
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                  darkMode 
                    ? "bg-gray-700 hover:bg-gray-600" 
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveMenu(item.key);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 group ${
                activeMenu === item.key
                  ? darkMode
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-blue-500 text-white shadow-lg"
                  : darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-blue-50 text-gray-600"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <span className={`transition-all duration-200 ${activeMenu === item.key ? "scale-110" : ""} ${
                collapsed ? "text-xl" : "text-lg mr-3"
              }`}>
                {item.icon}
              </span>
              
              {!collapsed && (
                <span className="font-medium transition-all duration-200">
                  {item.label}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t text-center ${
          darkMode ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"
        } ${collapsed ? "text-xs" : "text-sm"}`}>
          {!collapsed && "© 2025 Al-Ikhlaas Pharmacy"}
          {collapsed && "© 2025"}
        </div>
      </div>

      {/* Main Content Area - NO SPACE between sidebar and content */}
      <div className="flex-1 overflow-auto">

        {/* Mobile Header */}
        {isMobile && (
          <div className={`sticky top-0 z-30 p-4 border-b ${
            darkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-blue-100"
                }`}
              >
                <FaBars />
              </button>
              
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Al-Ikhlaas Pharmacy
              </h1>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${
                  darkMode ? "bg-gray-700" : "bg-blue-100"
                }`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>
        )}
        
        {/* Page Title for non-home pages */}
        {activeMenu !== "home" && !isMobile && (
          <div className={`border-b ${
            darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          } p-6`}>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-blue-500">
                {menuItems.find(item => item.key === activeMenu)?.icon}
              </span>
              {menuItems.find(item => item.key === activeMenu)?.label}
            </h1>
          </div>
        )}
        
        <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen`}>
  {renderContent()}
</div>

      </div>
    </div>
  );
};

export default Dashboard;