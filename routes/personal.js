const express = require("express");
const router = express.Router();
const db = require("../db");

// Initialize table
const initTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  db.query(sql, (err) => {
    if (err) console.error("❌ Table init error:", err);
    else console.log("✅ Customers table ready");
  });
};

initTable();

// POST personal info
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
    return res
      .status(400)
      .json({
        success: false,
        error:
          "First Name, Last Name, DOB, National ID, and Email are required",
      });
  }

  const sql = `
    INSERT INTO customers 
      (first_name, last_name, dob, national_id, phone, email, street, city, postal_code, country)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
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
      if (err)
        return res.status(500).json({success: false, error: err.message});
      res.json({success: true, customerId: result.insertId});
    }
  );
});

module.exports = router;
