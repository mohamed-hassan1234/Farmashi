// controllers/dashboardController.js
import Supplier from "../models/Supplier.js";
import Customer from "../models/Customer.js";
import Medicine from "../models/Medicine.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Payment from "../models/Payment.js";
import Debt from "../models/Debt.js";
import StockLog from "../models/StockLog.js";

export const getSummary = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (endDate) endDate.setHours(23, 59, 59, 999);

    // Helper to match date fields dynamically
    const dateMatch = (field) => {
      const match = {};
      if (startDate) match.$gte = startDate;
      if (endDate) match.$lte = endDate;
      return Object.keys(match).length ? { [field]: match } : {};
    };

    // ==== BASIC COUNTS ====
    const [supplierCount, customerCount, medicineCount] = await Promise.all([
      Supplier.countDocuments(),
      Customer.countDocuments(),
      Medicine.countDocuments(),
    ]);

    // ==== LOW STOCK & EXPIRED ====
    const lowStockCount = await Medicine.countDocuments({ quantity_in_stock: { $lte: 5 } });
    const expiredCount = await Medicine.countDocuments({ expiry_date: { $lt: new Date() } });

    // ==== SALES ====
    const saleAgg = [
      { $match: startDate || endDate ? dateMatch("sale_date") : {} },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "medicines",
          localField: "items.medicine_id",
          foreignField: "_id",
          as: "med",
        },
      },
      { $unwind: { path: "$med", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          total_revenue: { $sum: "$items.subtotal" },
          total_qty: { $sum: "$items.quantity" },
          total_cogs: { $sum: { $multiply: ["$items.quantity", "$med.buying_price"] } },
        },
      },
    ];

    const saleRes = await Sale.aggregate(saleAgg);
    const sales = saleRes[0] || { total_revenue: 0, total_qty: 0, total_cogs: 0 };

    // ==== PAYMENTS ====
    const paymentMatch = startDate || endDate ? dateMatch("date") : {};
    const paymentAgg = await Payment.aggregate([
      { $match: paymentMatch },
      { $group: { _id: "$type", total: { $sum: "$amount" } } },
    ]);

    // Match actual Payment schema enum values
    let payments = { customer_payment: 0, supplier_payment: 0 };
    paymentAgg.forEach((p) => {
      if (p._id === "customer_payment") payments.customer_payment = p.total;
      if (p._id === "supplier_payment") payments.supplier_payment = p.total;
    });

    // ==== DEBTS ====
    const debtMatch = startDate || endDate ? dateMatch("due_date") : {};
    const debtAgg = await Debt.aggregate([
      { $match: debtMatch },
      {
        $group: {
          _id: null,
          total_owed: { $sum: "$total_owed" },
          total_paid: { $sum: "$amount_paid" },
          total_remaining: { $sum: "$remaining_balance" },
          overdue_count: {
            $sum: {
              $cond: [
                { $and: [{ $lt: ["$due_date", new Date()] }, { $ne: ["$status", "cleared"] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);
    const debts = debtAgg[0] || { total_owed: 0, total_paid: 0, total_remaining: 0, overdue_count: 0 };

    // ==== PROFIT ====
    const grossProfit = sales.total_revenue - sales.total_cogs;
    const grossMargin = sales.total_revenue > 0
      ? (grossProfit / sales.total_revenue) * 100
      : 0;

    // ==== TOP SOLD MEDICINES ====
    const topSold = await Sale.aggregate([
      { $match: startDate || endDate ? dateMatch("sale_date") : {} },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.medicine_id",
          qty: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      {
        $lookup: {
          from: "medicines",
          localField: "_id",
          foreignField: "_id",
          as: "med",
        },
      },
      { $unwind: { path: "$med", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$med.name",
          qty: 1,
          revenue: 1,
          selling_price: "$med.selling_price",
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 10 },
    ]);

    // ==== RECENT STOCK LOGS ====
    const recentStockLogs = await StockLog.find().sort({ date: -1 }).limit(10).lean();

    // ==== FINAL RESPONSE ====
    return res.json({
      counts: {
        suppliers: supplierCount,
        customers: customerCount,
        medicines: medicineCount,
        low_stock: lowStockCount,
        expired: expiredCount,
      },
      sales,
      payments,
      debts,
      profit: {
        gross_profit: grossProfit,
        gross_margin: grossMargin.toFixed(2),
      },
      top_sold: topSold,
      recent_stock_logs: recentStockLogs,
    });
  } catch (err) {
    next(err);
  }
};
