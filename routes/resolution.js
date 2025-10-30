const express = require("express");
const router = express.Router();
const db = require("../db");
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
