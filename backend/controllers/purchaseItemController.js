import PurchaseItem from "../models/PurchaseItem.js";
import Medicine from "../models/Medicine.js";
import StockLog from "../models/StockLog.js";

// GET all purchase items by purchase_id
export const getPurchaseItems = async (req, res) => {
  try {
    const { purchase_id } = req.query;
    if (!purchase_id) return res.status(400).json({ message: "purchase_id is required" });

    const items = await PurchaseItem.find({ purchase_id })
      .populate("medicine_id", "name category_id supplier_id")
      .populate("purchase_id", "supplier_id purchase_date")
      .sort({ _id: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE purchase item
export const updatePurchaseItem = async (req, res) => {
  try {
    const { quantity, unit_price, user_id } = req.body;
    const item = await PurchaseItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Purchase item not found" });

    const med = await Medicine.findById(item.medicine_id);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    const qtyDiff = quantity - item.quantity;
    med.quantity_in_stock += qtyDiff;
    await med.save();

    await StockLog.create({
      medicine_id: med._id,
      change_type: "purchase_update",
      quantity_change: qtyDiff,
      user_id,
      date: new Date(),
    });

    item.quantity = quantity;
    item.unit_price = unit_price;
    item.subtotal = quantity * unit_price;
    await item.save();

    res.json({ message: "Purchase item updated", item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE purchase item
export const deletePurchaseItem = async (req, res) => {
  try {
    const { user_id } = req.body;
    const item = await PurchaseItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Purchase item not found" });

    const med = await Medicine.findById(item.medicine_id);
    if (med) {
      med.quantity_in_stock -= item.quantity;
      await med.save();

      await StockLog.create({
        medicine_id: med._id,
        change_type: "purchase_delete",
        quantity_change: -item.quantity,
        user_id,
        date: new Date(),
      });
    }

    await item.deleteOne();
    res.json({ message: "Purchase item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
