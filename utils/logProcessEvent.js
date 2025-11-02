const db = require("../db");

/**
 * Logs a process event dynamically.
 *
 * @param {string} processName - Name of the process (e.g., 'Complaint Management', 'Loan Closure')
 * @param {string} stageName - Stage of the process (e.g., 'Investigation', 'Resolution')
 * @param {string} stepName - Specific step (e.g., 'Capture Complaint', 'Assign and Analyze')
 * @param {string} status - 'started' | 'completed' | 'failed'
 */
function logProcessEvent(processName, stageName, stepName, status) {
  // Map status to EventType
  const eventTypeMap = {
    started: "StepStarted",
    completed: "StepCompletion",
    failed: "StepFailure",
  };

  const eventType = eventTypeMap[status] || "StepStarted";
  const eventObject = `${stageName} - ${stepName}`;

  const sql = `
    INSERT INTO process_events (ProcessID, EventType, EventObject)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [processName, eventType, eventObject], (err, results) => {
    if (err) {
      console.error(
        "❌ Error logging process event:",
        processName,
        stageName,
        stepName,
        status,
        err
      );
    } else {
      console.log(
        `✅ Event logged: ${processName} | ${eventType} | ${eventObject}`
      );
    }
  });
}

module.exports = logProcessEvent;
