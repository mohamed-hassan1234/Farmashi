import mongoose from "mongoose";

const stockLogSchema = new mongoose.Schema({
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  change_type: { type: String, enum: ["purchase","update_purchase", "sale", "adjustment",], required: true },
  quantity_change: { type: Number, required: true }, // +200 or -100
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("StockLog", stockLogSchema);
