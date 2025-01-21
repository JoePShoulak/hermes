const express = require("express");
const { exec } = require("child_process");

const router = express.Router();

// Helper function to execute a command and return a promise
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error || stderr) {
        return reject({ error: error.message || stderr.trim() });
      }
      resolve(stdout.trim());
    });
  });
}

// Route to get power status for a specific host
router.get("/power/HP/:id", async (req, res) => {
  const host = `hp${req.params.id}`;
  const command = `ilo ${host} power`;

  try {
    const output = await executeCommand(command);
    res.json({ host, output });
  } catch (err) {
    res.status(500).json({ host, error: err.error });
  }
});

// Route to get power status for all hosts
router.get("/power/all", async (req, res) => {
  const hosts = ["hp1", "hp2", "hp3", "hp4"]; // List of hosts
  const commands = hosts.map(host => ({
    host,
    command: `ilo ${host} power`,
  }));

  try {
    const results = await Promise.all(
      commands.map(async ({ host, command }) => {
        try {
          const output = await executeCommand(command);
          return { host, output };
        } catch (err) {
          return { host, error: err.error }; // Capture errors per host
        }
      })
    );
    res.json(results); // Return all results as an array
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve power statuses" });
  }
});

module.exports = router;
