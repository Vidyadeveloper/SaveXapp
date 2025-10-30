const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // ✅ parse JSON requests
app.use(express.static("public"));

// Route imports

const personal = require("./routes/personal"); // make sure this exists
const account = require("./routes/account"); // make sure this exists
const kyc = require("./routes/kyc"); // make sure this exists
const complaintRoutes = require("./routes/complaint");
const loanClosureRouter = require("./routes/loanClosureRoutes");
const loanApplication = require("./routes/loanApplication");
app.use("/api/loan", loanApplication);

app.use("/api/loan-closure", loanClosureRouter);
app.use("/api/complaint", complaintRoutes);
// Route setup
app.use("/api/personal", personal);
app.use("/api/account", account);
app.use("/api/kyc", kyc);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
