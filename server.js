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

// Route setup
app.use("/api/personal", personal);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
