import Customer from "../models/Customer.js";

export const getCustomers = async (req, res) => {
  const customers = await Customer.find().sort({ created_at: -1 });
  res.json(customers);
};

export const addCustomer = async (req, res) => {
  const { name, phone, address } = req.body;
  const c = await Customer.create({ name, phone, address });
  res.status(201).json(c);
};

export const updateCustomer = async (req, res) => {
  const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteCustomer = async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ message: "Customer deleted" });
};
