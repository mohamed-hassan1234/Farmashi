import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Customer", customerSchema);
