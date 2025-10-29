const express = require("express");
const router = express.Router();
const db = require("../db");

// POST account setup
router.post("/", (req, res) => {
  const {employeeId, accountType, commMode} = req.body;

  const sql = `
    UPDATE employees SET
      account_type = ?,
      comm_mode = ?
    WHERE id = ?
  `;

  db.query(sql, [accountType, commMode, employeeId], (err) => {
    if (err) return res.status(500).json({success: false, error: err.message});
    res.json({success: true});
  });
});

module.exports = router;
