const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const upload = multer({dest: "uploads/"});

// POST KYC info
router.post(
  "/",
  upload.fields([
    {name: "idProof"},
    {name: "addressProof"},
    {name: "incomeProof"},
  ]),
  (req, res) => {
    const {employeeId} = req.body;
    const files = req.files;

    const sql = `
    UPDATE employees SET
      id_proof = ?,
      address_proof = ?,
      income_proof = ?
    WHERE id = ?
  `;

    db.query(
      sql,
      [
        files.idProof?.[0]?.path || null,
        files.addressProof?.[0]?.path || null,
        files.incomeProof?.[0]?.path || null,
        employeeId,
      ],
      (err) => {
        if (err)
          return res.status(500).json({success: false, error: err.message});
        res.json({success: true});
      }
    );
  }
);

module.exports = router;
