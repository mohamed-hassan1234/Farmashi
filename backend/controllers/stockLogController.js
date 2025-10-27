import StockLog from "../models/StockLog.js";

export const getStockLogs = async (req, res) => {
  const logs = await StockLog.find()
    .populate("medicine_id", "name")
    .populate("user_id", "name")
    .sort({ date: -1 });
  res.json(logs);
};
