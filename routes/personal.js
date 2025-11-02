const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

// Save uploaded files to 'uploads' folder
const upload = multer({dest: "uploads/"});
const logProcessEvent = require(".././utils/logProcessEvent");

let uuidv4;

(async () => {
  try {
    const {v4} = await import("uuid");
    uuidv4 = v4;
    console.log("✅ UUID module loaded successfully.");
  } catch (e) {
    console.error("❌ Failed to load uuid module:", e);
  }
})();

// Initialize table
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      process_id VARCHAR(50) NOT NULL,
      process_status VARCHAR(20) DEFAULT 'started',
      process_step VARCHAR(100) DEFAULT 'Registration',
      process_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      dob DATE NOT NULL,
      national_id VARCHAR(50) UNIQUE NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(100) UNIQUE NOT NULL,
      street VARCHAR(150),
      city VARCHAR(50),
      postal_code VARCHAR(20),
      country VARCHAR(50),
      id_proof VARCHAR(255),
      address_proof VARCHAR(255),
      income_proof VARCHAR(255),
      verification_status VARCHAR(50) DEFAULT 'Pending',
      account_type VARCHAR(50),
      communication VARCHAR(100),
      onboarding_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("❌ Table init error:", err);
    else console.log("✅ Customers table ready");
  });
};
initTable();

// ✅ Stage 1: Personal Registration
router.post("/", (req, res) => {
  const {
    first_name,
    last_name,
    dob,
    national_id,
    phone,
    email,
    street,
    city,
    postal_code,
    country,
  } = req.body;

  if (!first_name || !last_name || !dob || !national_id || !email) {
    return res.status(400).json({
      success: false,
      error: "First Name, Last Name, DOB, National ID, and Email are required",
    });
  }

  const process_id = uuidv4();
  const stage = "Customer Identification";
  const step = "Capture Personal Details";

  logProcessEvent("Customer Onboarding", stage, step, "started");
  const sql = `
    INSERT INTO customers 
      (process_id, first_name, last_name, dob, national_id, phone, email, street, city, postal_code, country,
       process_status, process_step, process_timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'started', 'Registration', CURRENT_TIMESTAMP)
  `;

  db.query(
    sql,
    [
      process_id,
      first_name,
      last_name,
      dob,
      national_id,
      phone,
      email,
      street,
      city,
      postal_code,
      country,
    ],
    (err, result) => {
      if (err) {
        logProcessEvent("Customer Onboarding", stage, step, "failed");

        return res.status(500).json({success: false, error: err.message});
      }
      logProcessEvent("Customer Onboarding", stage, step, "completed");

      res.json({
        success: true,
        customerId: result.insertId,
        processId: process_id,
        processStep: "Registration",
      });
    }
  );
});

// ✅ Stage 2: KYC Upload → UPDATE with step & timestamp
router.post(
  "/kyc",
  upload.fields([
    {name: "idProof"},
    {name: "addressProof"},
    {name: "incomeProof"},
  ]),
  (req, res) => {
    const {customerId} = req.body;
    const files = req.files;

    if (!customerId) {
      return res
        .status(400)
        .json({success: false, error: "Missing customerId"});
    }

    const sql = `
      UPDATE customers SET
        id_proof = ?,
        address_proof = ?,
        income_proof = ?,
        verification_status = 'Completed',
        process_step = 'KYC Completed',
        process_status = 'in-progress',
        process_timestamp = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const stage = "KYC Verification";
    const step = "Upload and Verify Documents";

    logProcessEvent("Customer Onboarding", stage, step, "started");

    db.query(
      sql,
      [
        files?.idProof?.[0]?.path || null,
        files?.addressProof?.[0]?.path || null,
        files?.incomeProof?.[0]?.path || null,
        customerId,
      ],
      (err, result) => {
        if (err) {
          logProcessEvent("Customer Onboarding", stage, step, "failed");

          return res.status(500).json({success: false, error: err.message});
        }
        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({success: false, error: "Customer ID not found"});
        }
        logProcessEvent("Customer Onboarding", stage, step, "completed");

        res.json({
          success: true,
          message: "KYC Completed",
          processStep: "KYC Completed",
        });
      }
    );
  }
);

// ✅ Stage 3: Account Setup → Final Step
router.post("/account", (req, res) => {
  const {customerId, accountType, communication} = req.body;

  if (!customerId || !accountType || !communication) {
    return res.status(400).json({
      success: false,
      error: "Missing customerId, accountType, or communication",
    });
  }

  const sql = `
    UPDATE customers SET
      account_type = ?,
      communication = ?,
      onboarding_date = NOW(),
      process_step = 'Account Setup Completed',
      process_status = 'completed',
      process_timestamp = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const stage = "Account Setup";
  const step = "Create Customer Profile";

  logProcessEvent("Customer Onboarding", stage, step, "started");

  db.query(sql, [accountType, communication, customerId], (err, result) => {
    if (err) return res.status(500).json({success: false, error: err.message});

    if (result.affectedRows === 0) {
      logProcessEvent("Customer Onboarding", stage, step, "failed");

      return res
        .status(404)
        .json({success: false, error: "Customer ID not found"});
    }
    logProcessEvent("Customer Onboarding", stage, step, "completed");

    res.json({
      success: true,
      message: "Account Setup Completed",
      processStep: "Account Setup Completed",
      processStatus: "completed",
    });
  });
});

module.exports = router;
