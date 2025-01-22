const router = require("express").Router();

const { exec, execSync } = require("child_process"); // <–– Add execSync
// const ping = require("ping");

const ILO_TIMEOUT = 60000;

// GET single host iLO status
router.get("/power/:id", (req, res) => {
  const command = `ilo ${req.params.id} POWER`; // iLO command

  exec(command, { timeout: ILO_TIMEOUT }, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(
        `Error executing command for ${host}:`,
        error.message || stderr
      );
      return res.status(500).json({
        error: `Failed to run command for ${host}`,
        details: error.message || stderr,
      });
    }

    // parse stdout
    stdout = stdout.split("currently: ")[1]?.split("\r\n\r\n")[0] || "UNKNOWN";

    // Send the command output as JSON
    res.json({
      host,
      status: stdout.trim(),
    });
  });
});

module.exports = router;
