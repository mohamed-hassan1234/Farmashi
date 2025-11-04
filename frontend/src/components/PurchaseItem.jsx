import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext"; // 🔥 global theme

const PurchaseInvoice = ({ purchaseId, userId }) => {
  const { darkMode } = useTheme(); // 🔥 use global darkMode
  const [items, setItems] = useState([]);
  const [purchaseInfo, setPurchaseInfo] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const fetchPurchaseItems = async () => {
    try {
      const res = await axios.get(`/api/purchase-items?purchase_id=${purchaseId}`, { withCredentials: true });
      setItems(res.data);

      if (res.data.length > 0) {
        setPurchaseInfo({
          supplier: res.data[0].purchase_id?.supplier_id?.name || "Unknown",
          purchaseDate: res.data[0].purchase_id?.purchase_date || new Date(),
          totalAmount: res.data.reduce((acc, i) => acc + i.subtotal, 0)
        });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Failed to load purchase items" });
    }
  };

  useEffect(() => {
    if (purchaseId) fetchPurchaseItems();
  }, [purchaseId]);

  const totalAmount = items.reduce((acc, i) => acc + i.subtotal, 0);

  return (
    <div className={`p-6 min-h-screen transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <h1 className="text-3xl font-bold mb-6 text-blue-500">Purchase Invoice</h1>

      {alert.message && (
        <div className={`mb-4 p-3 rounded text-center font-semibold ${
          alert.type === "success"
            ? darkMode ? "bg-green-800 text-green-200" : "bg-green-100 text-green-700"
            : darkMode ? "bg-red-800 text-red-200" : "bg-red-100 text-red-700"
        }`}>
          {alert.message}
        </div>
      )}

      {purchaseInfo && (
        <div className={`p-6 rounded-lg shadow-md mb-6 transition-colors ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Invoice Details</h2>
            <p><strong>Supplier:</strong> {purchaseInfo.supplier}</p>
            <p><strong>Purchase Date:</strong> {new Date(purchaseInfo.purchaseDate).toLocaleDateString()}</p>
          </div>

          <table className="w-full border-collapse text-left mb-4">
            <thead>
              <tr className={`${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-200 text-gray-700"}`}>
                <th className="p-3 border">Medicine</th>
                <th className="p-3 border">Quantity</th>
                <th className="p-3 border">Unit Price</th>
                <th className="p-3 border">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                  <td className="p-2 border">{item.medicine_id?.name || "Unknown"}</td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">{item.unit_price}</td>
                  <td className="p-2 border">{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right text-xl font-semibold">
            Total Amount: {totalAmount}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoice;
