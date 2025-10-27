// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  customer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    
  },
  related_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Sale", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["customer_payment", "supplier_payment"], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  method: { 
    type: String, 
    enum: ["cash", "credit", "mobile"], 
    default: "cash" 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  status: {
    type: String,
    enum: ["completed", "pending", "failed"],
    default: "completed"
  },
  reference: {
    type: String,
    unique: true
  }
});

// Generate reference before saving
paymentSchema.pre("save", async function (next) {
  if (!this.reference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.reference = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Index for better performance
paymentSchema.index({ customer_id: 1, date: -1 });
paymentSchema.index({ reference: 1 });

export default mongoose.model("Payment", paymentSchema);