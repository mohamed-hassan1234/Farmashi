import Sale from "../models/Sale.js";
import Medicine from "../models/Medicine.js";
import StockLog from "../models/StockLog.js";
import Debt from "../models/Debt.js";
import Payment from "../models/Payment.js";

// GET all sales
export const getSales = async (req, res) => {
  const sales = await Sale.find()
    .populate("customer_id", "name phone")
    .populate("user_id", "name")
    .sort({ sale_date: -1 });
  res.json(sales);
};

// ADD sale
export const addSale = async (req, res) => {
  try {
    const { customer_id, user_id = null, items, sale_type = "cash", amount_paid = 0, sale_date } = req.body;

    if (!customer_id) return res.status(400).json({ message: "Customer is required" });
    if (!items || !items.length) return res.status(400).json({ message: "At least one item is required" });

    let total_amount = 0;

    for (const it of items) {
      const med = await Medicine.findById(it.medicine_id);
      if (!med) return res.status(404).json({ message: `Medicine ${it.medicine_id} not found` });
      if (it.quantity > med.quantity_in_stock) {
        return res.status(400).json({ message: `Quantity for ${med.name} exceeds available stock (${med.quantity_in_stock})` });
      }
      total_amount += Number(it.quantity) * Number(it.price);
    }

    const balance = total_amount - amount_paid;

    const sale = await Sale.create({
      customer_id,
      user_id,
      total_amount,
      amount_paid,
      balance,
      sale_type,
      sale_date: sale_date ? new Date(sale_date) : new Date(),
      items,
    });

    // update stock and stock logs
    for (const it of items) {
      const med = await Medicine.findById(it.medicine_id);
      med.quantity_in_stock -= it.quantity;
      await med.save();

      await StockLog.create({
        medicine_id: med._id,
        change_type: "sale",
        quantity_change: -Math.abs(it.quantity),
        user_id,
        date: new Date(),
      });
    }

    // payment record
    if (amount_paid > 0) {
      await Payment.create({
        related_id: sale._id,
        type: "customer_payment",
        amount: amount_paid,
        method: "cash",
        date: new Date(),
        user_id,
      });
    }

    // debt record if credit
    if (balance > 0) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await Debt.create({
        customer_id,
        sale_id: sale._id,
        total_owed: total_amount,
        amount_paid,
        remaining_balance: balance,
        due_date: dueDate,
        status: amount_paid === 0 ? "unpaid" : "partial",
      });
    }

    res.status(201).json({ message: "Sale recorded", sale_id: sale._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// controllers/saleController.js (add this function)
export const getSalesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const sales = await Sale.find({ customer_id: customerId })
      .populate("customer_id", "name phone address")
      .populate("items.medicine_id", "name selling_price")
      .sort({ sale_date: -1 });
    
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};