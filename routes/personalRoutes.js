const express = require("express");
const router = express.Router();
const db = require("../db");

// Create employees table if it doesn't exist
const createTableIfNotExists = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL
      )
    `;
    db.query(sql, (err) => {
      if (err) {
        console.error("❌ Error creating table:", err.message);
        return reject(err);
      }
      console.log("✅ Table 'employees' exists or created successfully.");
      resolve();
    });
  });
};

// Ensure columns exist, sequentially
const ensureColumns = async () => {
  const columns = {
    gender: "VARCHAR(10)",
    dob: "DATE",
    nationality: "VARCHAR(50)",
    marital_status: "VARCHAR(20)",
    contact: "VARCHAR(20)",
    address: "TEXT",
  };

  for (const [col, type] of Object.entries(columns)) {
    await new Promise((resolve, reject) => {
      const checkSql = `SHOW COLUMNS FROM employees LIKE '${col}'`;
      db.query(checkSql, (err, result) => {
        if (err) return reject(err);

        if (result.length === 0) {
          const addSql = `ALTER TABLE employees ADD COLUMN ${col} ${type}`;
          db.query(addSql, (err2) => {
            if (err2) {
              console.error(`❌ Error adding column ${col}:`, err2.message);
              return reject(err2);
            }
            console.log(`✅ Column ${col} added`);
            resolve();
          });
        } else {
          console.log(`✅ Column ${col} already exists`);
          resolve();
        }
      });
    });
  }
};

// Initialize table and columns on server start
const initDatabase = async () => {
  try {
    await createTableIfNotExists();
    await ensureColumns();
    console.log("✅ Database ready.");
  } catch (err) {
    console.error("❌ Database initialization failed:", err.message);
  }
};

initDatabase();

// POST route to add personal info
router.post("/", (req, res) => {
  const {
    name,
    gender,
    dob,
    nationality,
    marital_status,
    contact,
    email,
    address,
  } = req.body;

  const sql = `INSERT INTO employees 
    (name, gender, dob, nationality, marital_status, contact, email, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [name, gender, dob, nationality, marital_status, contact, email, address],
    (err, result) => {
      if (err) return res.status(500).json({error: err.message});
      res.json({success: true, employeeId: result.insertId});
    }
  );
});

module.exports = router;
