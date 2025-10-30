router.post(
  "/investigation",
  upload.single("supporting_evidence"),
  (req, res) => {
    const {
      customer_id,
      assigned_dept,
      assigned_officer,
      investigation_notes,
      complaint_id,
    } = req.body;

    if (!complaint_id || !customer_id || !assigned_dept || !assigned_officer) {
      return res
        .status(400)
        .json({success: false, error: "Missing required fields"});
    }

    const sql = `
    UPDATE complaints SET
      assigned_dept = ?,
      assigned_officer = ?,
      investigation_notes = ?,
      supporting_evidence = ?
    WHERE complaint_id = ? AND customer_id = ?
  `;

    db.query(
      sql,
      [
        assigned_dept,
        assigned_officer,
        investigation_notes || null,
        req.file?.path || null,
        complaint_id,
        customer_id,
      ],
      (err, result) => {
        if (err)
          return res.status(500).json({success: false, error: err.message});
        res.json({success: true});
      }
    );
  }
);
module.exports = router;
