// controllers/paymentController.js
import Payment from "../models/Payment.js";
import Debt from "../models/Debt.js";
import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user_id", "name email")
      .populate("customer_id", "name phone address")
      .populate("related_id") // Populate sale or purchase details
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const { customer_id, related_id, type, amount, method = "cash", user_id } = req.body;
    
    if (!customer_id || !related_id || !type || !amount) {
      return res.status(400).json({ message: "All fields are required: customer_id, related_id, type, amount" });
    }

    // Verify customer exists
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Create payment
    const payment = await Payment.create({
      customer_id,
      related_id,
      type,
      amount: Number(amount),
      method,
      date: new Date(),
      user_id: user_id || req.user?._id, // From authenticated user
    });

    // If payment is customer_payment, update debt/sale accordingly
    if (type === "customer_payment") {
      await handleCustomerPayment(related_id, amount, customer.name);
    }

    // Populate the newly created payment with customer details
    const populatedPayment = await Payment.findById(payment._id)
      .populate("customer_id", "name phone address")
      .populate("user_id", "name email");

    res.status(201).json({
      message: getPaymentMessage(type, method, amount, customer.name),
      payment: populatedPayment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const handleCustomerPayment = async (saleId, amount, customerName) => {
  try {
    // Update debt record
    const debt = await Debt.findOne({ sale_id: saleId });
    if (debt) {
      debt.amount_paid = Number(debt.amount_paid) + Number(amount);
      debt.remaining_balance = Number(debt.total_owed) - Number(debt.amount_paid);
      debt.status = debt.remaining_balance <= 0 ? "cleared" : "partial";
      await debt.save();

      // Send notification for credit payments
      if (debt.remaining_balance > 0) {
        console.log(`💰 REMINDER: ${customerName} still owes $${debt.remaining_balance}. Please collect your money!`);
      }
    }

    // Update sale record
    const sale = await Sale.findById(saleId);
    if (sale) {
      sale.amount_paid = Number(sale.amount_paid) + Number(amount);
      sale.balance = Number(sale.total_amount) - Number(sale.amount_paid);
      await sale.save();
    }
  } catch (error) {
    console.error("Error updating debt/sale:", error);
  }
};

const getPaymentMessage = (type, method, amount, customerName) => {
  const formattedAmount = `$${Number(amount).toFixed(2)}`;
  
  if (type === "customer_payment") {
    if (method === "credit") {
      return `💰 CREDIT PAYMENT: ${customerName} paid ${formattedAmount}. Remember to collect remaining balance!`;
    }
    return `✅ PAYMENT SUCCESS: ${customerName} paid ${formattedAmount} via ${method.toUpperCase()}`;
  } else {
    return `🏢 SUPPLIER PAYMENT: Processed ${formattedAmount} via ${method.toUpperCase()}`;
  }
};

// Get payments by customer
export const getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const payments = await Payment.find({ customer_id: customerId })
      .populate("user_id", "name email")
      .populate("customer_id", "name phone address")
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get payment statistics
export const getPaymentStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalPayments = await Payment.countDocuments();
    const todayPayments = await Payment.countDocuments({ 
      date: { $gte: today } 
    });
    const totalAmount = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const todayAmount = await Payment.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      totalPayments,
      todayPayments,
      totalAmount: totalAmount[0]?.total || 0,
      todayAmount: todayAmount[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};