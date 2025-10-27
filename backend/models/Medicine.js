import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },                 // Medicine name
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Linked to category
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" }, // Default supplier
  quantity_in_stock: { type: Number, default: 0 },       // Current stock
  buying_price: { type: Number, required: true },       // Cost per unit
  selling_price: { type: Number, required: true },      // Selling price per unit
  expiry_date: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  // Add a history array to track stock changes (optional, for more detailed tracking)
  stock_history: [{
    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['purchase','sale'], required: true },
    sale_id: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" } // link if sale
  }]
});

export default mongoose.model("Medicine", medicineSchema);
