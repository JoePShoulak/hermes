const router = require("express").Router();
const { exec } = require("child_process");

router.get("/power/all", (req, res) => {
  res.json("all");
});

router.get("/power/HP/:id", (req, res) => {
  const host = `hp${req.params.id}`;
  const command = `ilo ${host} power`; // Build the command

  exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
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

    // Send the command output as a JSON response
    res.json({
      host,
      output: stdout.trim(),
    });
  });
});

router.put("/power/HP/:id", (req, res) => {
  const id = req.params.id;
  const update = req.body.update;
  res.json({ id, update });
});

module.exports = router;
