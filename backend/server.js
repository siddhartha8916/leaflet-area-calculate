const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint that logs request body to a file based on session ID
app.post("/api/v1/coordinates", (req, res) => {
  const sessionId = req.body.sessionId;
  const logMessage = `
----------------
Session ID: ${sessionId}
Received data: ${JSON.stringify(req.body, null, 2)}
----------------
  `;

  // Define the log file path (logs will be stored in a 'logs' directory)
  const logDir = path.join(__dirname, "logs");
  const logFile = path.join(logDir, `${sessionId}.log`);

  // Ensure the 'logs' directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  // Append the log message to the file (create the file if it doesn't exist)
  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      console.error("Error writing log:", err);
    } else {
      console.log(`Log written for session ID: ${sessionId}`);
    }
  });
  console.dir(req.body, { depth: null });

  // Respond with success message
  res.status(200).json({ message: "Data received successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
