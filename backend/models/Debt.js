// models/Debt.js
import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
  customer_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Customer", 
    required: true 
  },
  sale_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Sale", 
    required: true 
  },
  total_owed: { 
    type: Number, 
    required: true 
  },
  amount_paid: { 
    type: Number, 
    default: 0 
  },
  remaining_balance: { 
    type: Number, 
    required: true 
  },
  due_date: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "partial", "cleared", "overdue"], 
    default: "pending" 
  },
  last_payment_date: Date,
  payment_reminders: [{
    date: Date,
    message: String,
    sent: { type: Boolean, default: false }
  }]
});

// Auto-update status based on remaining balance
debtSchema.pre("save", function (next) {
  if (this.remaining_balance <= 0) {
    this.status = "cleared";
  } else if (this.amount_paid > 0) {
    this.status = "partial";
  } else {
    this.status = "pending";
  }

  // Check if overdue
  if (this.due_date < new Date() && this.status !== "cleared") {
    this.status = "overdue";
  }

  next();
});

export default mongoose.model("Debt", debtSchema);