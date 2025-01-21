const router = require("express").Router();
const { exec } = require("child_process");

const ILO_TIMEOUT = 30000;

router.get("/power/all", (req, res) => {
  res.json("all");
});

router.get("/power/HP/:id", (req, res) => {
  const host = `hp${req.params.id}`;
  const command = `ilo ${host} power`; // Build the command

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
    stdout = stdout.split("currently: ")[1].split("\r\n\r\n")[0];

    // Send the command output as a JSON response
    res.json({
      host,
      power: stdout.trim(),
    });
  });
});

router.put("/power/HP/:id", (req, res) => {
  const id = req.params.id;
  const update = req.body.update;
  res.json({ id, update });
});

module.exports = router;
