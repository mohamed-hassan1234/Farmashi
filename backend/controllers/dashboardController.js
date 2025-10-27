// controllers/dashboardController.js
import Medicine from "../models/Medicine.js";
import Customer from "../models/Customer.js";
import Sale from "../models/Sale.js";
import Debt from "../models/Debt.js";
import Purchase from "../models/Purchase.js";
import Payment from "../models/Payment.js";

export const getDashboardData = async (req, res) => {
  try {
    const { range = "monthly" } = req.query;
    const now = new Date();
    let startDate;

    // Calculate start date based on range
    switch (range) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "yearly":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Basic counts
    const medicineCount = await Medicine.countDocuments();
    const customerCount = await Customer.countDocuments();
    
    // Stock status
    const lowStock = await Medicine.find({ quantity_in_stock: { $lt: 10 } }).populate('supplier_id');
    const lowStockCount = await Medicine.countDocuments({ quantity_in_stock: { $lt: 10, $gt: 0 } });
    const outOfStockCount = await Medicine.countDocuments({ quantity_in_stock: 0 });
    const inStockCount = await Medicine.countDocuments({ quantity_in_stock: { $gte: 10 } });

    // Sales data
    const sales = await Sale.find({ sale_date: { $gte: startDate } });
    const totalSales = sales.length;
    
    // Revenue calculations
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total_amount, 0);
    const cashSales = sales.filter(sale => sale.sale_type === 'cash').length;
    const creditSales = sales.filter(sale => sale.sale_type === 'credit').length;

    // Profit calculations
    let totalProfit = 0;
    let totalExpenses = 0;

    for (const sale of sales) {
      for (const item of sale.items) {
        const medicine = await Medicine.findById(item.medicine_id);
        if (medicine) {
          const profit = (item.price - medicine.buying_price) * item.quantity;
          totalProfit += profit;
        }
      }
    }

    // Purchase expenses
    const purchases = await Purchase.find({ purchase_date: { $gte: startDate } });
    totalExpenses = purchases.reduce((acc, purchase) => acc + purchase.total_amount, 0);

    const netProfit = totalProfit - totalExpenses;

    // Debt calculations
    const debts = await Debt.find();
    const totalDebt = debts.reduce((acc, debt) => acc + debt.remaining_balance, 0);
    const debtPaid = debts.reduce((acc, debt) => acc + debt.amount_paid, 0);
    const debtPending = debts.filter(debt => debt.status === 'pending').reduce((acc, debt) => acc + debt.remaining_balance, 0);
    const debtOverdue = debts.filter(debt => debt.status === 'overdue').reduce((acc, debt) => acc + debt.remaining_balance, 0);

    // Payment data
    const payments = await Payment.find({ date: { $gte: startDate } });
    const pendingPayments = payments.filter(payment => payment.status === 'pending').length;

    // Active customers (made purchases in the period)
    const activeCustomers = await Sale.distinct('customer_id', { sale_date: { $gte: startDate } });

    // Generate trend data
    const profitLossTrend = generateTrendData(range, 'profit');
    const revenueTrend = generateTrendData(range, 'revenue');

    // Growth calculations (simplified)
    const previousPeriodData = await getPreviousPeriodData(range, startDate);
    const revenueGrowth = calculateGrowth(totalRevenue, previousPeriodData.revenue);
    const profitGrowth = calculateGrowth(netProfit, previousPeriodData.profit);
    const customerGrowth = calculateGrowth(activeCustomers.length, previousPeriodData.customers);

    res.json({
      // Basic metrics
      medicineCount,
      customerCount,
      totalSales,
      
      // Financial metrics
      totalRevenue,
      totalProfit,
      netProfit,
      totalExpenses,
      
      // Stock metrics
      lowStock,
      lowStockCount,
      outOfStockCount,
      inStockCount,
      
      // Sales distribution
      cashSales,
      creditSales,
      pendingPayments,
      
      // Debt metrics
      totalDebt,
      debtPaid,
      debtPending,
      debtOverdue,
      
      // Customer metrics
      activeCustomers: activeCustomers.length,
      
      // Growth metrics
      revenueGrowth,
      profitGrowth,
      customerGrowth,
      
      // Trend data
      profitLossTrend,
      revenueTrend
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
const generateTrendData = (range, type) => {
  const labels = [];
  const data = [];
  
  switch (range) {
    case 'daily':
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
        data.push(Math.random() * 1000);
      }
      break;
    case 'weekly':
      labels.push('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun');
      for (let i = 0; i < 7; i++) {
        data.push(Math.random() * 5000);
      }
      break;
    case 'monthly':
      for (let i = 1; i <= 30; i++) {
        labels.push(`Day ${i}`);
        data.push(Math.random() * 2000);
      }
      break;
    case 'yearly':
      labels.push('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
      for (let i = 0; i < 12; i++) {
        data.push(Math.random() * 10000);
      }
      break;
  }

  if (type === 'profit') {
    return {
      labels,
      profit: data,
      loss: data.map(value => value * -0.3) // Simulate some losses
    };
  }

  return { labels, data };
};

const getPreviousPeriodData = async (range, currentStartDate) => {
  // Simplified implementation - in real app, you'd query the database
  return {
    revenue: Math.random() * 100000,
    profit: Math.random() * 50000,
    customers: Math.floor(Math.random() * 1000)
  };
};

const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 100;
  return ((current - previous) / previous * 100).toFixed(1);
};