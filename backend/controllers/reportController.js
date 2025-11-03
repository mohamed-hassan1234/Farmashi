import Report from "../models/Report.js";

// GET: Generate and save a report
export const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, type, include_zero_sales } = req.body;
    const generated_by = req.user ? req.user._id : null;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "startDate and endDate are required" });
    }

    const report = await Report.generate({
      startDate,
      endDate,
      generated_by,
      type: type || "custom",
      include_zero_sales: include_zero_sales || false
    });

    res.status(201).json(report);
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};

// GET: Fetch all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ generated_at: -1 })
      .populate('generated_by', 'name email')
      .lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
};

// GET: Fetch a single report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).lean();
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch report", error: err.message });
  } 
};