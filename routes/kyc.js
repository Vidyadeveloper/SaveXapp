const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");

// Save uploaded files to 'uploads' folder
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
    const {customerId, verificationStatus} = req.body;
    const files = req.files;

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

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
        verification_status = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        files.idProof?.[0]?.path || null,
        files.addressProof?.[0]?.path || null,
        files.incomeProof?.[0]?.path || null,
        verificationStatus || "Pending",
        customerId,
      ],
      (err, result) => {
        if (err) {
          console.error("❌ KYC update error:", err);
          return res.status(500).json({success: false, error: err.message});
        }

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({success: false, error: "Customer ID not found"});
        }

        console.log(`✅ KYC updated for customer ID ${customerId}`);
        res.json({success: true});
      }
    );
  }
);

module.exports = router;
