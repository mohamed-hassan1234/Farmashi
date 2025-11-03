import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "cashier"], required: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);