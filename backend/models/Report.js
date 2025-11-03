import mongoose from "mongoose";
import Sale from "./Sale.js";
import Medicine from "./Medicine.js";

const reportSchema = new mongoose.Schema({
  title: { type: String },
  type: { type: String, enum: ["daily","weekly","monthly","custom"], default: "custom" },
  period_start: { type: Date, required: true },
  period_end: { type: Date, required: true },
  generated_at: { type: Date, default: Date.now },
  generated_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  totals: {
    total_sold_qty: { type: Number, default: 0 },
    total_revenue: { type: Number, default: 0 },
    total_medicine_cost: { type: Number, default: 0 },
    gross_profit: { type: Number, default: 0 },
    gross_margin: { type: Number, default: 0 },
    total_medicines_analyzed: { type: Number, default: 0 },
    profitable_medicines: { type: Number, default: 0 },
    loss_medicines: { type: Number, default: 0 }
  },

  by_medicine: [
    {
      medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      name: String,
      category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      category_name: String,
      quantity_in_stock: Number,
      sold_qty: Number,
      remaining_stock: Number,
      medicine_price: Number,
      total_medicine_value: Number,
      sold_revenue: Number,
      average_sale_price: Number,
      profit: Number,
      profit_margin: Number,
      is_profit: { type: Boolean, default: false },
      notes: String,
      
      // NEW FIELDS FOR YOUR CORRECT CALCULATION
      buying_price: Number,
      total_buying_cost: Number, // buying_price * quantity_in_stock
      status: { type: String, enum: ["profit", "loss", "break_even"], default: "break_even" },
      performance: { type: String, enum: ["excellent", "good", "average", "poor"], default: "average" },
      recommendation: String
    }
  ],

  by_category: [
    {
      category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: String,
      sold_qty: Number,
      sold_revenue: Number,
      total_medicine_cost: Number,
      gross_profit: Number,
      // NEW FIELDS
      total_buying_cost: Number,
      status: String,
      profit_margin: Number
    }
  ],

  filters: {
    include_zero_sales: { type: Boolean, default: false }
  },

  executive_summary: {
    overall_performance: String,
    key_insights: [String],
    top_performers: [Object],
    areas_of_concern: [Object]
  },

  notes: String
});

// Static helper to generate report with YOUR CORRECT LOGIC
reportSchema.statics.generate = async function ({ startDate, endDate, generated_by = null, type = "custom", include_zero_sales = false }) {
  const Report = this;
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23,59,59,999);

  // Get all medicines with current stock
  const allMedicines = await Medicine.find().populate('category_id').lean();
  
  // Aggregate sales for the period
  const salesData = await Sale.aggregate([
    { $match: { sale_date: { $gte: start, $lte: end } } },
    { $unwind: "$items" },
    { 
      $group: { 
        _id: "$items.medicine_id", 
        sold_qty: { $sum: "$items.quantity" }, 
        sold_revenue: { $sum: "$items.subtotal" }
      } 
    }
  ]);

  // Create sales map for easy lookup
  const salesMap = new Map();
  salesData.forEach(sale => {
    salesMap.set(sale._id.toString(), {
      sold_qty: sale.sold_qty,
      sold_revenue: sale.sold_revenue
    });
  });

  // Filter medicines based on include_zero_sales
  let medicinesToProcess = allMedicines;
  if (!include_zero_sales) {
    medicinesToProcess = allMedicines.filter(med => 
      salesMap.has(med._id.toString()) && salesMap.get(med._id.toString()).sold_qty > 0
    );
  }

  const by_medicine = [];
  let totals = { 
    total_sold_qty: 0, 
    total_revenue: 0, 
    total_medicine_cost: 0, 
    gross_profit: 0,
    total_medicines_analyzed: medicinesToProcess.length,
    profitable_medicines: 0,
    loss_medicines: 0
  };

  // Process each medicine with YOUR CORRECT LOGIC
  for (const medicine of medicinesToProcess) {
    const medicineId = medicine._id.toString();
    const saleInfo = salesMap.get(medicineId) || { sold_qty: 0, sold_revenue: 0 };
    
    const quantity_in_stock = medicine.quantity_in_stock || 0;
    const sold_qty = saleInfo.sold_qty;
    const sold_revenue = saleInfo.sold_revenue;
    const medicine_price = medicine.selling_price || 0;
    const buying_price = medicine.buying_price || 0;
    const remaining_stock = quantity_in_stock - sold_qty;
    const total_medicine_value = quantity_in_stock * medicine_price;
    const average_sale_price = sold_qty > 0 ? sold_revenue / sold_qty : 0;
    
    // YOUR CORRECT PROFIT/LOSS CALCULATION
    const total_buying_cost = buying_price * quantity_in_stock; // buying_price * current_stock
    const profit = sold_revenue - total_buying_cost; // sold_revenue - (buying_price * quantity_in_stock)
    
    const profit_margin = sold_revenue > 0 ? (profit / sold_revenue) * 100 : 0;
    
    // Determine status based on YOUR LOGIC
    let status = "break_even";
    let is_profit = false;
    
    if (profit > 0) {
      status = "profit";
      is_profit = true;
    } else if (profit < 0) {
      status = "loss";
      is_profit = false;
    }
    
    // Determine performance level
    let performance = "average";
    if (profit_margin > 50) performance = "excellent";
    else if (profit_margin > 25) performance = "good";
    else if (profit_margin < 0) performance = "poor";
    
    // Generate insights and recommendations
    let notes = "";
    let recommendation = "";
    
    if (status === "profit") {
      notes = `Profit: Revenue (${formatCurrency(sold_revenue)}) > Buying Cost (${formatCurrency(total_buying_cost)})`;
      if (performance === "excellent") {
        recommendation = "Excellent profit - consider increasing stock";
      } else if (performance === "good") {
        recommendation = "Good profit - maintain current strategy";
      } else {
        recommendation = "Profitable - monitor performance";
      }
    } else if (status === "loss") {
      notes = `Loss: Revenue (${formatCurrency(sold_revenue)}) < Buying Cost (${formatCurrency(total_buying_cost)})`;
      recommendation = "Review pricing or consider discontinuing";
    } else {
      notes = "Break even - revenue equals buying cost";
      recommendation = "Monitor closely, consider price adjustment";
    }
    
    if (remaining_stock === 0 && sold_qty > 0) {
      notes += " | Out of stock but had sales";
      recommendation = "Restock immediately to meet demand";
    }

    const medicineReport = {
      medicine_id: medicine._id,
      name: medicine.name,
      category_id: medicine.category_id?._id || medicine.category_id,
      category_name: medicine.category_id?.name || 'Uncategorized',
      quantity_in_stock,
      sold_qty,
      remaining_stock,
      medicine_price,
      total_medicine_value,
      sold_revenue,
      average_sale_price,
      profit,
      profit_margin: parseFloat(profit_margin.toFixed(2)),
      is_profit,
      notes,
      // NEW FIELDS
      buying_price,
      total_buying_cost,
      status,
      performance,
      recommendation
    };

    by_medicine.push(medicineReport);

    // Update totals
    totals.total_sold_qty += sold_qty;
    totals.total_revenue += sold_revenue;
    totals.total_medicine_cost += total_buying_cost; // Use total_buying_cost instead
    totals.gross_profit += profit;
    
    if (status === "profit") totals.profitable_medicines++;
    else if (status === "loss") totals.loss_medicines++;
  }

  // Calculate final totals
  totals.gross_margin = totals.total_revenue > 0 ? 
    parseFloat(((totals.gross_profit / totals.total_revenue) * 100).toFixed(2)) : 0;

  // Group by category
  const categoryMap = new Map();
  for (const medicine of by_medicine) {
    const categoryId = medicine.category_id?.toString() || 'uncategorized';
    const categoryName = medicine.category_name;
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        category_id: medicine.category_id,
        name: categoryName,
        sold_qty: 0,
        sold_revenue: 0,
        total_medicine_cost: 0,
        gross_profit: 0,
        total_buying_cost: 0
      });
    }
    
    const category = categoryMap.get(categoryId);
    category.sold_qty += medicine.sold_qty;
    category.sold_revenue += medicine.sold_revenue;
    category.total_medicine_cost += medicine.total_buying_cost;
    category.total_buying_cost += medicine.total_buying_cost;
    category.gross_profit += medicine.profit;
  }

  // Calculate category margins and status
  const by_category = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    profit_margin: cat.sold_revenue > 0 ? 
      parseFloat(((cat.gross_profit / cat.sold_revenue) * 100).toFixed(2)) : 0,
    status: cat.gross_profit > 0 ? "profit" : cat.gross_profit < 0 ? "loss" : "break_even"
  }));

  // Generate executive summary
  const executive_summary = generateExecutiveSummary(by_medicine, totals, by_category);

  // Save report
  const reportTitle = type === 'custom' 
    ? `Custom Report ${start.toISOString().slice(0,10)} to ${end.toISOString().slice(0,10)}`
    : `${type.charAt(0).toUpperCase() + type.slice(1)} Report ${start.toISOString().slice(0,10)}`;

  const doc = await Report.create({
    title: reportTitle,
    type,
    period_start: start,
    period_end: end,
    generated_by,
    totals,
    by_medicine,
    by_category,
    executive_summary,
    filters: { include_zero_sales }
  });

  return doc;
};

// Helper function for executive summary
function generateExecutiveSummary(medicines, totals, categories) {
  const topPerformers = medicines
    .filter(m => m.status === "profit")
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
    .map(m => ({ 
      name: m.name, 
      profit: m.profit, 
      margin: m.profit_margin,
      revenue: m.sold_revenue,
      buying_cost: m.total_buying_cost
    }));

  const lossMakers = medicines
    .filter(m => m.status === "loss")
    .sort((a, b) => a.profit - b.profit)
    .slice(0, 5)
    .map(m => ({ 
      name: m.name, 
      loss: Math.abs(m.profit), 
      margin: m.profit_margin,
      revenue: m.sold_revenue,
      buying_cost: m.total_buying_cost
    }));

  const keyInsights = [];
  
  if (totals.gross_margin > 30) {
    keyInsights.push("Excellent overall profitability");
  } else if (totals.gross_margin > 15) {
    keyInsights.push("Good profitability maintained");
  } else if (totals.gross_margin > 0) {
    keyInsights.push("Moderate profitability, room for improvement");
  } else {
    keyInsights.push("Overall losses detected - immediate action required");
  }

  keyInsights.push(`Total Revenue: ${formatCurrency(totals.total_revenue)}`);
  keyInsights.push(`Total Buying Cost: ${formatCurrency(totals.total_medicine_cost)}`);
  keyInsights.push(`${totals.profitable_medicines} out of ${totals.total_medicines_analyzed} medicines are profitable`);
  
  if (lossMakers.length > 0) {
    keyInsights.push(`${lossMakers.length} medicines are generating losses`);
  }

  const overall_performance = totals.gross_margin > 20 ? "Excellent" : 
                            totals.gross_margin > 10 ? "Good" : 
                            totals.gross_margin > 0 ? "Fair" : "Poor";

  return {
    overall_performance,
    key_insights: keyInsights,
    top_performers: topPerformers,
    areas_of_concern: lossMakers
  };
}

// Helper function for currency formatting
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
}

reportSchema.index({ period_start: 1, period_end: 1 });
reportSchema.index({ generated_at: -1 });

export default mongoose.model("Report", reportSchema);