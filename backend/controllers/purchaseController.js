import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import PurchaseItem from "../models/PurchaseItem.js";
import Medicine from "../models/Medicine.js";

// get all purchases
export const getPurchases = async (req, res) => {
  const purchases = await Purchase.find()
    .populate("supplier_id", "name")
    .populate("user_id", "name")
    .sort({ purchase_date: -1 });
  res.json(purchases);
};

// add purchase + items WITHOUT updating stock
export const addPurchase = async (req, res) => {
  try {
    const { supplier_id, user_id, total_amount, items, status } = req.body;

    const purchase = await Purchase.create({
      supplier_id,
      user_id,
      total_amount,
      status,
      purchase_date: new Date(),
    });

    // Create purchase items without modifying medicine stock
    for (const item of items) {
      await PurchaseItem.create({
        purchase_id: purchase._id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      });
      
      // REMOVED the stock update logic
    }

    res.status(201).json({ message: "Purchase recorded", id: purchase._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update purchase + items WITHOUT updating stock
export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_id, status, items } = req.body;

    const purchase = await Purchase.findById(id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    purchase.supplier_id = supplier_id || purchase.supplier_id;
    purchase.status = status || purchase.status;
    await purchase.save();

    // Delete existing items and create new ones
    await PurchaseItem.deleteMany({ purchase_id: id });

    for (const item of items) {
      await PurchaseItem.create({
        purchase_id: id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      });
      
      // REMOVED the stock update logic
    }

    res.json({ message: "Purchase updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier_id", "name")
      .populate("user_id", "name");
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    const items = await PurchaseItem.find({ purchase_id: purchase._id })
      .populate("medicine_id", "name quantity_in_stock price");

    res.json({ ...purchase.toObject(), items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};