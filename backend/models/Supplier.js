import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Supplier name
  contact: { type: String }, // Phone
  address: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Supplier", supplierSchema);
