import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  purchase_id: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
  medicine_id: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  subtotal: { type: Number, required: true } // quantity × unit_price
});

export default mongoose.model("PurchaseItem", purchaseItemSchema);
