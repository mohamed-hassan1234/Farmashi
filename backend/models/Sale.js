import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  total_amount: { type: Number, required: true }, // Total sale
  amount_paid: { type: Number, required: true },
  balance: { type: Number, required: true },
  sale_type: { type: String, enum: ["cash", "credit"], default: "cash" },
  sale_date: { type: Date, default: Date.now },
  items: [
    {
      medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
      name: String,
      quantity: Number,
      price: Number,
      subtotal: Number
    }
  ]
});

// 💰 Middleware: Auto calculate balance
saleSchema.pre("save", function (next) {
  this.balance = this.total_amount - this.amount_paid;
  next();
});

export default mongoose.model("Sale", saleSchema);
