import Debt from "../models/Debt.js";
import Payment from "../models/Payment.js";
import Sale from "../models/Sale.js";

export const getDebts = async (req, res) => {
  const debts = await Debt.find()
    .populate("customer_id", "name phone")
    .populate("sale_id", "total_amount sale_date")
    .sort({ due_date: 1 });
  res.json(debts);
};

// Pay towards a debt or record arbitrary payment
export const payDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const { amount, method = "cash", user_id } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const debt = await Debt.findById(debtId);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    // Create payment linked to sale
    await Payment.create({
      related_id: debt.sale_id,
      type: "customer_payment",
      amount,
      method,
      date: new Date(),
      user_id,
    });

    // update debt amounts
    debt.amount_paid = Number(debt.amount_paid) + Number(amount);
    debt.remaining_balance = Number(debt.total_owed) - Number(debt.amount_paid);

    if (debt.remaining_balance <= 0) {
      debt.status = "cleared";
      debt.remaining_balance = 0;
    } else {
      debt.status = "partial";
    }

    await debt.save();

    // Also update the corresponding sale's amount_paid and balance
    const sale = await Sale.findById(debt.sale_id);
    if (sale) {
      sale.amount_paid = Number(sale.amount_paid) + Number(amount);
      sale.balance = Number(sale.total_amount) - Number(sale.amount_paid);
      await sale.save();
    }

    res.json({ message: "Payment recorded", debt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update debt info
export const updateDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const { total_owed, due_date } = req.body;

    const debt = await Debt.findById(debtId);
    if (!debt) return res.status(404).json({ message: "Debt not found" });

    if (total_owed !== undefined) debt.total_owed = total_owed;
    if (due_date) debt.due_date = new Date(due_date);

    debt.remaining_balance = debt.total_owed - debt.amount_paid;
    if (debt.remaining_balance <= 0) debt.status = "cleared";
    else if (debt.amount_paid > 0) debt.status = "partial";
    else debt.status = "unpaid";

    await debt.save();
    res.json({ message: "Debt updated", debt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete debt
export const deleteDebt = async (req, res) => {
  try {
    const { debtId } = req.params;
    const debt = await Debt.findByIdAndDelete(debtId);
    if (!debt) return res.status(404).json({ message: "Debt not found" });
    res.json({ message: "Debt deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
