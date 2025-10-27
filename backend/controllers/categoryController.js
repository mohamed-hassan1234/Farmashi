import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  const data = await Category.find();
  res.json(data);
};

export const addCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};

export const updateCategory = async (req, res) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
};
