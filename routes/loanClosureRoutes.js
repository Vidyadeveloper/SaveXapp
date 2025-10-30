const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

// File upload setup (for Closure Certificate)
const upload = multer({dest: "uploads/"});

// Initialize loan_closures table
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS loan_closures (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      loan_account_no VARCHAR(50) NOT NULL,
      closure_reason VARCHAR(50),
      requested_date DATE,
      outstanding_principal DECIMAL(15,2),
      interest_due DECIMAL(15,2),
      penalties DECIMAL(15,2),
      total_payable DECIMAL(15,2),
      payment_mode VARCHAR(50),
      closure_confirmation_date DATE,
      closure_certificate VARCHAR(255),
      lien_release_date DATE,
      confirmation_email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("❌ Loan closure table init error:", err);
    else console.log("✅ Loan closure table ready");
  });
};
initTable();

// Stage 1: Closure Request
router.post("/request", (req, res) => {
  const {customer_id, loan_account_no, closure_reason, requested_date} =
    req.body;

  if (!customer_id || !loan_account_no || !closure_reason) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    INSERT INTO loan_closures
      (customer_id, loan_account_no, closure_reason, requested_date)
    VALUES (?, ?, ?, ?)
  `;
  db.query(
    sql,
    [customer_id, loan_account_no, closure_reason, requested_date],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, closureId: result.insertId});
    }
  );
});

// Stage 2: Payment Settlement
router.post("/settlement", (req, res) => {
  const {
    customer_id,
    loan_account_no,
    outstanding_principal,
    interest_due,
    penalties,
    total_payable,
    payment_mode,
  } = req.body;

  if (
    !customer_id ||
    !loan_account_no ||
    total_payable === undefined ||
    !payment_mode
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    UPDATE loan_closures SET
      outstanding_principal = ?,
      interest_due = ?,
      penalties = ?,
      total_payable = ?,
      payment_mode = ?
    WHERE customer_id = ? AND loan_account_no = ?
  `;

  db.query(
    sql,
    [
      outstanding_principal,
      interest_due,
      penalties,
      total_payable,
      payment_mode,
      customer_id,
      loan_account_no,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true});
    }
  );
});

// Stage 3: Finalization
router.post("/finalize", upload.single("closure_certificate"), (req, res) => {
  const {
    customer_id,
    loan_account_no,
    closure_confirmation_date,
    lien_release_date,
    confirmation_email,
  } = req.body;

  if (!customer_id || !loan_account_no || !closure_confirmation_date) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    UPDATE loan_closures SET
      closure_confirmation_date = ?,
      closure_certificate = ?,
      lien_release_date = ?,
      confirmation_email = ?
    WHERE customer_id = ? AND loan_account_no = ?
  `;

  db.query(
    sql,
    [
      closure_confirmation_date,
      req.file?.path || null,
      lien_release_date || null,
      confirmation_email || null,
      customer_id,
      loan_account_no,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true});
    }
  );
});

module.exports = router;
