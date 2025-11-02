// routes/complaint.js
const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const logProcessEvent = require(".././utils/logProcessEvent");
let uuidv4;

(async () => {
  try {
    // Dynamic import returns a Promise that resolves to the module object
    const {v4} = await import("uuid");
    uuidv4 = v4; // Assign the v4 function to the global uuidv4 variable
    console.log("✅ UUID module loaded successfully.");
  } catch (e) {
    console.error("❌ Failed to load uuid module:", e);
    // Handle error, e.g., exit process if critical
  }
})();
// Setup file upload (for supporting evidence)
const upload = multer({dest: "uploads/"});

// Initialize complaints table with process fields
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      process_id VARCHAR(50) NOT NULL,
      complaint_id VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT NOT NULL,
      category VARCHAR(50),
      description TEXT,
      date_received DATE,
      priority VARCHAR(20),
      assigned_dept VARCHAR(100),
      assigned_officer VARCHAR(100),
      investigation_notes TEXT,
      supporting_evidence VARCHAR(255),
      resolution_type VARCHAR(50),
      resolution_summary TEXT,
      resolution_date DATE,
      customer_ack VARCHAR(10),
      process_status VARCHAR(20) DEFAULT 'started',
      process_step VARCHAR(100) DEFAULT 'Registration',
      process_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("❌ Complaint table init error:", err);
    else console.log("✅ Complaint table ready with process tracking");
  });
};
initTable();
router.post("/registration", (req, res) => {
  const {
    complaint_id,
    customer_id,
    category,
    description,
    date_received,
    priority,
  } = req.body;

  if (!complaint_id || !customer_id || !category || !description) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const process_id = uuidv4(); // Generate new process_id for this complaint
  const stage = "Complaint Registration";
  const step = "Capture Complaint";

  // Log StepStarted
  logProcessEvent("Complaint Management", stage, step, "started");

  const sql = `
    INSERT INTO complaints 
      (process_id, complaint_id, customer_id, category, description, date_received, priority, process_status, process_step, process_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'started', ?, CURRENT_TIMESTAMP)
  `;

  db.query(
    sql,
    [
      process_id,
      complaint_id,
      customer_id,
      category,
      description,
      date_received,
      priority,
      stage,
    ],
    (err, result) => {
      if (err) {
        // Log StepFailure
        logProcessEvent("Complaint Management", stage, step, "failed");
        return res.status(500).json({success: false, error: err.message});
      }

      // Log StepCompletion
      logProcessEvent("Complaint Management", stage, step, "completed");

      res.json({
        success: true,
        complaintId: complaint_id,
        processId: process_id,
      });
    }
  );
});

// -------------------------
// Step 2: Investigation
// -------------------------
router.post(
  "/investigation",
  upload.single("supporting_evidence"),
  (req, res) => {
    const {
      process_id,
      customer_id,
      assigned_dept,
      assigned_officer,
      investigation_notes,
      complaint_id,
    } = req.body;

    if (
      !process_id ||
      !complaint_id ||
      !customer_id ||
      !assigned_dept ||
      !assigned_officer
    ) {
      return res
        .status(400)
        .json({success: false, error: "Missing required fields"});
    }

    const stage = "Investigation";
    const step = "Assign and Analyze";

    // Log StepStarted
    logProcessEvent("Complaint Management", stage, step, "started");

    const sql = `
      UPDATE complaints SET
        assigned_dept = ?,
        assigned_officer = ?,
        investigation_notes = ?,
        supporting_evidence = ?,
        process_status = 'updated',
        process_step = ?,
        process_timestamp = CURRENT_TIMESTAMP
      WHERE process_id = ? AND complaint_id = ? AND customer_id = ?
    `;

    db.query(
      sql,
      [
        assigned_dept,
        assigned_officer,
        investigation_notes || null,
        req.file?.path || null,
        stage,
        process_id,
        complaint_id,
        customer_id,
      ],
      (err, result) => {
        if (err) {
          // Log StepFailure
          logProcessEvent("Complaint Management", stage, step, "failed");
          return res.status(500).json({success: false, error: err.message});
        }

        // Log StepCompletion
        logProcessEvent("Complaint Management", stage, step, "completed");

        res.json({success: true});
      }
    );
  }
);

// -------------------------
// Step 3: Resolution
// -------------------------
router.post("/resolution", (req, res) => {
  const {
    process_id,
    customer_id,
    complaint_id,
    resolution_type,
    resolution_summary,
    resolution_date,
    customer_ack,
  } = req.body;

  if (
    !process_id ||
    !complaint_id ||
    !customer_id ||
    !resolution_type ||
    !resolution_summary
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const stage = "Resolution";
  const step = "Provide Resolution";

  // Log StepStarted
  logProcessEvent("Complaint Management", stage, step, "started");

  const sql = `
    UPDATE complaints SET
      resolution_type = ?,
      resolution_summary = ?,
      resolution_date = ?,
      customer_ack = ?,
      process_status = 'completed',
      process_step = ?,
      process_timestamp = CURRENT_TIMESTAMP
    WHERE process_id = ? AND complaint_id = ? AND customer_id = ?
  `;

  db.query(
    sql,
    [
      resolution_type,
      resolution_summary,
      resolution_date,
      customer_ack,
      stage,
      process_id,
      complaint_id,
      customer_id,
    ],
    (err, result) => {
      if (err) {
        // Log StepFailure
        logProcessEvent("Complaint Management", stage, step, "failed");
        return res.status(500).json({success: false, error: err.message});
      }

      // Log StepCompletion
      logProcessEvent("Complaint Management", stage, step, "completed");

      res.json({success: true});
    }
  );
});
module.exports = router;
