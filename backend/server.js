import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
// app.js (backend)


app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // enable cookies
  }) 
);
 // Customize origin for security

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Import routes
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import purchaseItemRoutes from "./routes/purchaseItemRoutes.js";
import stockLogRoutes from "./routes/stockLogRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import debtRoutes from "./routes/debtRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js"; // route-ka profit report
import dashbaordRoute from "./routes/dashboardRoutes.js";  

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/purchase-items", purchaseItemRoutes);
app.use("/api/stock-logs", stockLogRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", dashbaordRoute);


// Health check
app.get("/", (req, res) => res.send("Pharmacy Backend is running"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
