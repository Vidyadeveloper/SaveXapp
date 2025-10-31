const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
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
// File upload setup
const upload = multer({dest: "uploads/"});

// --- TABLE INITIALIZATION ---
const initLoanApplicationsTable = () => {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS loan_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      process_id VARCHAR(50) NOT NULL,
      property_type VARCHAR(50) NOT NULL,
      property_address VARCHAR(255) NOT NULL,
      property_value DECIMAL(15,2) NOT NULL,
      desired_loan_amount DECIMAL(15,2) NOT NULL,
      tenure INT NOT NULL,
      loan_purpose VARCHAR(255) NOT NULL,
      employer_name VARCHAR(255) NULL,
      annual_income DECIMAL(15,2) NULL,
      pay_slips VARCHAR(255) NULL,
      property_ownership_papers VARCHAR(255) NULL,
      sale_agreement VARCHAR(255) NULL,
      credit_score INT NULL,
      debt_to_income_ratio DECIMAL(5,2) NULL,
      risk_category ENUM('Low','Medium','High') DEFAULT 'Low',
      approved_amount DECIMAL(15,2) NULL,
      interest_rate DECIMAL(5,3) NULL,
      approval_date DATE NULL,
      approver_name VARCHAR(255) NULL,
      loan_account VARCHAR(50) NULL,
      disbursement_amount DECIMAL(15,2) NULL,
      disbursement_date DATE NULL,
      beneficiary_iban VARCHAR(50) NULL,
      transaction_ref VARCHAR(100) NULL,
      application_status ENUM('Requested','Documents Pending','Under Review','Approved','Disbursed','Rejected') DEFAULT 'Requested',
      process_status VARCHAR(20) DEFAULT 'started',
      process_step VARCHAR(100) DEFAULT 'Registration',
      process_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.query(createTableSql, (err) => {
    if (err) console.error("❌ Error creating loan_applications table:", err);
    else console.log("✅ loan_applications table initialized successfully.");
  });
};

initLoanApplicationsTable();

// -------------------------
// Stage 1: Loan Request
// -------------------------
router.post("/loan_request", (req, res) => {
  const {
    customer_id,
    property_type,
    property_address,
    property_value,
    desired_loan_amount,
    tenure,
    loan_purpose,
  } = req.body;

  if (
    !customer_id ||
    !property_type ||
    !property_address ||
    !property_value ||
    !desired_loan_amount ||
    !tenure ||
    !loan_purpose
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const process_id = uuidv4();

  const sql = `
    INSERT INTO loan_applications
      (process_id, customer_id, property_type, property_address, property_value, desired_loan_amount, tenure, loan_purpose, process_status, process_step, process_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'started', 'Registration', CURRENT_TIMESTAMP)
  `;

  db.query(
    sql,
    [
      process_id,
      customer_id,
      property_type,
      property_address,
      property_value,
      desired_loan_amount,
      tenure,
      loan_purpose,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({
        success: true,
        processId: process_id,
        applicationId: result.insertId,
      });
    }
  );
});

// -------------------------
// Stage 2: Document Collection
// -------------------------
router.post(
  "/document_collection",
  upload.fields([
    {name: "pay_slips", maxCount: 1},
    {name: "property_ownership_papers", maxCount: 1},
    {name: "sale_agreement", maxCount: 1},
  ]),
  (req, res) => {
    const {process_id, employer_name, annual_income} = req.body;

    if (!process_id || !employer_name || !annual_income) {
      return res
        .status(400)
        .json({success: false, error: "Missing required fields"});
    }

    const pay_slips = req.files["pay_slips"]?.[0]?.path || null;
    const property_ownership_papers =
      req.files["property_ownership_papers"]?.[0]?.path || null;
    const sale_agreement = req.files["sale_agreement"]?.[0]?.path || null;

    const sql = `
      UPDATE loan_applications SET
        employer_name = ?,
        annual_income = ?,
        pay_slips = ?,
        property_ownership_papers = ?,
        sale_agreement = ?,
        application_status = 'Documents Pending',
        process_status = 'in_progress',
        process_step = 'Document Collection',
        process_timestamp = CURRENT_TIMESTAMP
      WHERE process_id = ?
    `;

    db.query(
      sql,
      [
        employer_name,
        annual_income,
        pay_slips,
        property_ownership_papers,
        sale_agreement,
        process_id,
      ],
      (err, result) => {
        if (err)
          return res.status(500).json({success: false, error: err.message});
        res.json({success: true, updatedRows: result.affectedRows});
      }
    );
  }
);

// -------------------------
// Stage 3: Evaluation
// -------------------------
router.post("/evaluation", (req, res) => {
  const {
    process_id,
    credit_score,
    debt_to_income_ratio,
    risk_category,
    approved_amount,
    interest_rate,
    approval_date,
    approver_name,
  } = req.body;

  if (
    !process_id ||
    !credit_score ||
    !debt_to_income_ratio ||
    !risk_category ||
    !approved_amount ||
    !interest_rate ||
    !approval_date ||
    !approver_name
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    UPDATE loan_applications SET
      credit_score = ?,
      debt_to_income_ratio = ?,
      risk_category = ?,
      approved_amount = ?,
      interest_rate = ?,
      approval_date = ?,
      approver_name = ?,
      application_status = 'Approved',
      process_status = 'in_progress',
      process_step = 'Evaluation',
      process_timestamp = CURRENT_TIMESTAMP
    WHERE process_id = ?
  `;

  db.query(
    sql,
    [
      credit_score,
      debt_to_income_ratio,
      risk_category,
      approved_amount,
      interest_rate,
      approval_date,
      approver_name,
      process_id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, updatedRows: result.affectedRows});
    }
  );
});

// -------------------------
// Stage 4: Disbursement
// -------------------------
router.post("/disbursement", (req, res) => {
  const {
    process_id,
    loan_account,
    disbursement_amount,
    disbursement_date,
    beneficiary_iban,
    transaction_ref,
  } = req.body;

  if (
    !process_id ||
    !loan_account ||
    !disbursement_amount ||
    !disbursement_date ||
    !beneficiary_iban ||
    !transaction_ref
  ) {
    return res
      .status(400)
      .json({success: false, error: "Missing required fields"});
  }

  const sql = `
    UPDATE loan_applications SET
      loan_account = ?,
      disbursement_amount = ?,
      disbursement_date = ?,
      beneficiary_iban = ?,
      transaction_ref = ?,
      application_status = 'Disbursed',
      process_status = 'completed',
      process_step = 'Disbursement',
      process_timestamp = CURRENT_TIMESTAMP
    WHERE process_id = ?
  `;

  db.query(
    sql,
    [
      loan_account,
      disbursement_amount,
      disbursement_date,
      beneficiary_iban,
      transaction_ref,
      process_id,
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, updatedRows: result.affectedRows});
    }
  );
});

module.exports = router;
