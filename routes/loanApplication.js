const express = require("express");
const router = express.Router();
const db = require("../db"); // Assuming your database connection is here
const multer = require("multer");

// 💾 File upload setup
// Creates a folder named 'uploads' in your root directory if it doesn't exist.
const upload = multer({dest: "uploads/"});

// --- TABLE INITIALIZATION ---

const initLoanApplicationsTable = () => {
  console.log("ℹ️ Checking/Creating loan_applications table...");
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS loan_applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,

      -- Stage 1: Loan Request Fields
      property_type VARCHAR(50) NOT NULL,
      property_address VARCHAR(255) NOT NULL,
      property_value DECIMAL(15, 2) NOT NULL,
      desired_loan_amount DECIMAL(15, 2) NOT NULL,
      tenure INT NOT NULL,
      loan_purpose VARCHAR(255) NOT NULL,

      -- Stage 2: Document Collection Fields (NULLable as they are updated later)
      employer_name VARCHAR(255) NULL,
      annual_income DECIMAL(15, 2) NULL,
      pay_slips VARCHAR(255) NULL,
      property_ownership_papers VARCHAR(255) NULL,
      sale_agreement VARCHAR(255) NULL,

      -- Stage 3: Evaluation Fields (NULLable as they are updated later)
      credit_score INT NULL,
      debt_to_income_ratio DECIMAL(5, 2) NULL,
      risk_category ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
      approved_amount DECIMAL(15, 2) NULL,
      interest_rate DECIMAL(5, 3) NULL,
      approval_date DATE NULL,
      approver_name VARCHAR(255) NULL,

      -- Stage 4: Disbursement Fields (NULLable as they are updated later)
      loan_account VARCHAR(50) NULL,
      disbursement_amount DECIMAL(15, 2) NULL,
      disbursement_date DATE NULL,
      beneficiary_iban VARCHAR(50) NULL,
      transaction_ref VARCHAR(100) NULL,

      -- Status and Timestamps
      application_status ENUM('Requested', 'Documents Pending', 'Under Review', 'Approved', 'Disbursed', 'Rejected') DEFAULT 'Requested',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createTableSql, (err) => {
    if (err) {
      console.error("❌ Error creating loan_applications table:", err);
    } else {
      console.log("✅ loan_applications table initialized successfully.");
    }
  });
};

// Initialize the table when the router loads
initLoanApplicationsTable();

// --- LOAN APPLICATION ENDPOINTS ---
// All subsequent stages (2, 3, 4) will update the record using the unique 'id' (applicationId)
// generated in Stage 1.

// Stage 1: Loan Request (Creates the new application record)
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

  // Input Validation
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
      .json({
        success: false,
        error: "Missing required fields for loan request.",
      });
  }

  const sql = `
    INSERT INTO loan_applications
      (customer_id, property_type, property_address, property_value, desired_loan_amount, tenure, loan_purpose)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
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

      // 🔑 Important: Return the new ID for subsequent stages
      res.json({success: true, applicationId: result.insertId});
    }
  );
});

// Stage 2: Document Collection (Updates the existing application record)
router.post(
  "/document_collection",
  upload.fields([
    {name: "pay_slips", maxCount: 1},
    {name: "property_ownership_papers", maxCount: 1},
    {name: "sale_agreement", maxCount: 1},
  ]),
  (req, res) => {
    // 💡 Using 'application_id' instead of 'customer_id' for uniqueness
    const {application_id, employer_name, annual_income} = req.body;

    // Input Validation
    if (!application_id || !employer_name || !annual_income) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Missing required fields for document collection.",
        });
    }

    // Get file paths (will be null if file is not uploaded)
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
        application_status = 'Documents Pending'
      WHERE id = ?  /* 🔑 WHERE clause uses the unique application ID */
    `;

    db.query(
      sql,
      [
        employer_name,
        annual_income,
        pay_slips,
        property_ownership_papers,
        sale_agreement,
        application_id, // Use the application_id
      ],
      (err, result) => {
        if (err)
          return res.status(500).json({success: false, error: err.message});
        res.json({success: true, updatedRows: result.affectedRows});
      }
    );
  }
);

// Stage 3: Evaluation (Updates the existing application record)
router.post("/evaluation", (req, res) => {
  const {
    application_id, // 💡 Using 'application_id'
    credit_score,
    debt_to_income_ratio,
    risk_category,
    approved_amount,
    interest_rate,
    approval_date,
    approver_name,
  } = req.body;

  // Input Validation
  if (
    !application_id ||
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
      .json({success: false, error: "Missing required fields for evaluation."});
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
      application_status = 'Approved'
    WHERE id = ? /* 🔑 WHERE clause uses the unique application ID */
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
      application_id, // Use the application_id
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, updatedRows: result.affectedRows});
    }
  );
});

// Stage 4: Disbursement (Updates the existing application record)
router.post("/disbursement", (req, res) => {
  const {
    application_id, // 💡 Using 'application_id'
    loan_account,
    disbursement_amount,
    disbursement_date,
    beneficiary_iban,
    transaction_ref,
  } = req.body;

  // Input Validation
  if (
    !application_id ||
    !loan_account ||
    !disbursement_amount ||
    !disbursement_date ||
    !beneficiary_iban ||
    !transaction_ref
  ) {
    return res
      .status(400)
      .json({
        success: false,
        error: "Missing required fields for disbursement.",
      });
  }

  const sql = `
    UPDATE loan_applications SET
      loan_account = ?,
      disbursement_amount = ?,
      disbursement_date = ?,
      beneficiary_iban = ?,
      transaction_ref = ?,
      application_status = 'Disbursed'
    WHERE id = ? /* 🔑 WHERE clause uses the unique application ID */
  `;

  db.query(
    sql,
    [
      loan_account,
      disbursement_amount,
      disbursement_date,
      beneficiary_iban,
      transaction_ref,
      application_id, // Use the application_id
    ],
    (err, result) => {
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, updatedRows: result.affectedRows});
    }
  );
});

module.exports = router;
