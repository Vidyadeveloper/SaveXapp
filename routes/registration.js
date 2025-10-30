const express = require("express");
const router = express.Router();
const db = require("../db");

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
module.exports = router;
