const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

// Setup file upload (for supporting evidence)
const upload = multer({dest: "uploads/"});

// Initialize complaints table
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("❌ Complaint table init error:", err);
    else console.log("✅ Complaint table ready");
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

  const sql = `
    INSERT INTO complaints 
      (complaint_id, customer_id, category, description, date_received, priority)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [complaint_id, customer_id, category, description, date_received, priority],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, complaintId: complaint_id});
    }
  );
});
router.post(
  "/investigation",
  upload.single("supporting_evidence"),
  (req, res) => {
    const {
      customer_id,
      assigned_dept,
      assigned_officer,
      investigation_notes,
      complaint_id,
    } = req.body;

    if (!complaint_id || !customer_id || !assigned_dept || !assigned_officer) {
      return res
        .status(400)
        .json({success: false, error: "Missing required fields"});
    }

    const sql = `
    UPDATE complaints SET
      assigned_dept = ?,
      assigned_officer = ?,
      investigation_notes = ?,
      supporting_evidence = ?
    WHERE complaint_id = ? AND customer_id = ?
  `;

    db.query(
      sql,
      [
        assigned_dept,
        assigned_officer,
        investigation_notes || null,
        req.file?.path || null,
        complaint_id,
        customer_id,
      ],
      (err, result) => {
        if (err)
          return res.status(500).json({success: false, error: err.message});
        res.json({success: true});
      }
    );
  }
);

router.post("/resolution", (req, res) => {
  const {
    customer_id,
    complaint_id,
    resolution_type,
    resolution_summary,
    resolution_date,
    customer_ack,
  } = req.body;

  if (
    !complaint_id ||
    !customer_id ||
    !resolution_type ||
    !resolution_summary
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    UPDATE complaints SET
      resolution_type = ?,
      resolution_summary = ?,
      resolution_date = ?,
      customer_ack = ?
    WHERE complaint_id = ? AND customer_id = ?
  `;

  db.query(
    sql,
    [
      resolution_type,
      resolution_summary,
      resolution_date,
      customer_ack,
      complaint_id,
      customer_id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true});
    }
  );
});

module.exports = router;
