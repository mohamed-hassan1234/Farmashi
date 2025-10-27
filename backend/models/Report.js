// models/Report.js
import mongoose from "mongoose";
import Sale from "./Sale.js";
import StockLog from "./StockLog.js";
import Medicine from "./Medicine.js";

const reportSchema = new mongoose.Schema({
  title: { type: String },
  type: { type: String, enum: ["daily","weekly","monthly","custom"], default: "custom" },
  period_start: { type: Date, required: true },
  period_end: { type: Date, required: true },
  generated_at: { type: Date, default: Date.now },
  generated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  totals: {
    total_purchased_qty: { type: Number, default: 0 },
    total_purchased_cost: { type: Number, default: 0 },
    total_sold_qty: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_cogs: { type: Number, default: 0 },
    gross_profit: { type: Number, default: 0 },
    gross_margin: { type: Number, default: 0 }
  },

  by_medicine: [
    {
      medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      name: String,
      category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      opening_stock: Number,
      purchased_qty: Number,
      purchased_cost: Number,
      sold_qty: Number,
      sold_revenue: Number,
      cogs: Number,
      gross_profit: Number,
      gross_margin: Number,
      closing_stock: Number,
      is_loss: { type: Boolean, default: false },
      notes: String
    }
  ],

  by_category: [
    {
      category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: String,
      purchased_qty: Number,
      purchased_cost: Number,
      sold_qty: Number,
      sold_revenue: Number,
      cogs: Number,
      gross_profit: Number
    }
  ],

  filters: {
    include_zero_sales: { type: Boolean, default: false }
  },

  notes: String
});

// Static helper to generate report
reportSchema.statics.generate = async function ({ startDate, endDate, generated_by = null, type = "custom", include_zero_sales = false }) {
  const Report = this;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23,59,59,999);

  // Aggregate purchases
  const purchases = await StockLog.aggregate([
    { $match: { change_type: { $in: ["purchase","update_purchase"] }, date: { $gte: start, $lte: end } } },
    { $group: { _id: "$medicine_id", purchased_qty: { $sum: "$quantity_change" } } }
  ]);

  // Aggregate sales
  const sales = await Sale.aggregate([
    { $match: { sale_date: { $gte: start, $lte: end } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.medicine_id", sold_qty: { $sum: "$items.quantity" }, sold_revenue: { $sum: "$items.subtotal" } } }
  ]);

  // Convert to maps
  const purchasesMap = new Map(purchases.map(p => [p._id.toString(), p.purchased_qty]));
  const salesMap = new Map(sales.map(s => [s._id.toString(), { sold_qty: s.sold_qty, sold_revenue: s.sold_revenue }]));

  // Medicine filter
  const medicineFilter = include_zero_sales ? {} : {
    $or: [
      { _id: { $in: [...purchasesMap.keys()].map(k => new mongoose.Types.ObjectId(k)) } },
      { _id: { $in: [...salesMap.keys()].map(k => new mongoose.Types.ObjectId(k)) } }
    ]
  };
  const medicines = await Medicine.find(medicineFilter).lean();

  // Compute opening stock helper
  async function computeOpening(medId) {
    const before = await StockLog.aggregate([
      { $match: { medicine_id: new mongoose.Types.ObjectId(medId), date: { $lt: start } } },
      { $group: { _id: null, qty: { $sum: "$quantity_change" } } }
    ]);
    return before[0] && before[0].qty ? before[0].qty : 0;
  }

  const by_medicine = [];
  let totals = { total_purchased_qty:0, total_purchased_cost:0, total_sold_qty:0, total_revenue:0, total_cogs:0, gross_profit:0 };

  for (const med of medicines) {
    const id = med._id.toString();
    const purchased_qty = purchasesMap.get(id) || 0;
    const sold = salesMap.get(id) || { sold_qty: 0, sold_revenue: 0 };

    const opening_stock = await computeOpening(id);
    const closing_stock = opening_stock + purchased_qty - sold.sold_qty;

    const purchased_cost = purchased_qty * (med.buying_price || 0);
    const cogs = sold.sold_qty * (med.buying_price || 0);
    const gross_profit = (sold.sold_revenue || 0) - cogs;
    const gross_margin = (sold.sold_revenue && sold.sold_revenue > 0) ? (gross_profit / sold.sold_revenue) * 100 : 0;

    by_medicine.push({
      medicine_id: med._id,
      name: med.name,
      category_id: med.category_id,
      opening_stock,
      purchased_qty,
      purchased_cost,
      sold_qty: sold.sold_qty,
      sold_revenue: sold.sold_revenue,
      cogs,
      gross_profit,
      gross_margin,
      closing_stock,
      is_loss: gross_profit < 0
    });

    totals.total_purchased_qty += purchased_qty;
    totals.total_purchased_cost += purchased_cost;
    totals.total_sold_qty += sold.sold_qty;
    totals.total_revenue += sold.sold_revenue || 0;
    totals.total_cogs += cogs;
    totals.gross_profit += gross_profit;
  }

  totals.gross_margin = totals.total_revenue ? (totals.gross_profit / totals.total_revenue) * 100 : 0;

  // Group by category
  const categoryMap = new Map();
  for (const m of by_medicine) {
    const key = (m.category_id || "uncategorized").toString();
    if (!categoryMap.has(key)) categoryMap.set(key, { category_id: m.category_id, name: null, purchased_qty:0, purchased_cost:0, sold_qty:0, sold_revenue:0, cogs:0, gross_profit:0 });
    const c = categoryMap.get(key);
    c.purchased_qty += m.purchased_qty;
    c.purchased_cost += m.purchased_cost;
    c.sold_qty += m.sold_qty;
    c.sold_revenue += m.sold_revenue;
    c.cogs += m.cogs;
    c.gross_profit += m.gross_profit;
  }
  const by_category = Array.from(categoryMap.values());

  // Save report
  const doc = await Report.create({
    title: `Report ${start.toISOString().slice(0,10)} -> ${end.toISOString().slice(0,10)}`,
    type,
    period_start: start,
    period_end: end,
    generated_by,
    totals,
    by_medicine,
    by_category,
    filters: { include_zero_sales }
  });

  return doc;
};

reportSchema.index({ period_start: 1, period_end: 1 });
reportSchema.index({ generated_at: -1 });

export default mongoose.model("Report", reportSchema);
