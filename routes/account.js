const express = require("express");
const router = express.Router();
const db = require("../db");

// POST account setup
router.post("/", (req, res) => {
  const {customerId, accountType, communication} = req.body;

  // Validate required fields
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
      onboarding_date = NOW()
    WHERE id = ?
  `;

  db.query(sql, [accountType, communication, customerId], (err, result) => {
    if (err) {
      console.error("❌ Account setup error:", err);
      return res.status(500).json({success: false, error: err.message});
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({success: false, error: "Customer ID not found"});
    }

    console.log(`✅ Account setup updated for customer ID ${customerId}`);
    res.json({success: true});
  });
});

module.exports = router;
