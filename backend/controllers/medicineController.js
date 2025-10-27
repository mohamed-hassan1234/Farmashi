import Medicine from "../models/Medicine.js";
import StockLog from "../models/StockLog.js";

export const getMedicines = async (req, res) => {
  const meds = await Medicine.find()
    .populate("category_id", "name")
    .populate("supplier_id", "name");
  res.json(meds);
};

export const addMedicine = async (req, res) => {
  const med = await Medicine.create(req.body);
  res.status(201).json(med);
};

export const updateMedicine = async (req, res) => {
  const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(med);
};

export const deleteMedicine = async (req, res) => {
  await Medicine.findByIdAndDelete(req.params.id);
  res.json({ message: "Medicine deleted" });
};

// adjust stock (optional endpoint)
export const adjustStock = async (req, res) => {
  const { quantity_change, change_type, user_id } = req.body;
  const med = await Medicine.findById(req.params.id);
  med.quantity_in_stock += quantity_change;
  await med.save();

  await StockLog.create({
    medicine_id: med._id,
    change_type,
    quantity_change,
    user_id,
    date: new Date(),
  });

  res.json({ message: "Stock updated", stock: med.quantity_in_stock });
};
