import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_amount: { type: Number, required: true }, // Total cost
  purchase_date: { type: Date, default: Date.now },
  status: { type: String, enum: ["paid", "pending"], default: "paid" }
});

export default mongoose.model("Purchase", purchaseSchema);
