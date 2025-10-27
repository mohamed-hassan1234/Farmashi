import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Full name of user
  username: { type: String, required: true, unique: true }, // Login username
  password: { type: String, required: true }, // Hashed password
  role: { type: String, enum: ["admin", "cashier"], required: true }, // Role in system
  created_at: { type: Date, default: Date.now } // Timestamp
});

export default mongoose.model("User", userSchema);
