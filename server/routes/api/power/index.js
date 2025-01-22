const router = require("express").Router();

const { exec, execSync } = require("child_process"); // <–– Add execSync
// const ping = require("ping");

const ILO_TIMEOUT = 60000;

// GET single host iLO status
router.get("/:id", (req, res) => {
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

// PUT request to power host ON/OFF/RESET
// router.put("/power/HP/:id", (req, res) => {
//   const host = `hp${req.params.id}`;
//   const { state } = req.body; // Extract "state" from the request payload

//   if (!state) {
//     return res.status(400).json({ error: "Missing 'state' in request body" });
//   }

//   const command = `ilo ${host} POWER ${state}`; // e.g. "ilo hp2 POWER ON"
//   console.log(`Running command: ${command}`);

//   exec(command, { timeout: ILO_TIMEOUT }, (error, stdout, stderr) => {
//     if (error || stderr) {
//       console.error(
//         `Error executing command for ${host}:`,
//         error.message || stderr
//       );
//       return res.status(500).json({
//         error: `Failed to execute command for ${host}`,
//         details: error.message || stderr,
//       });
//     }

//     console.log(`- no errors (${host})`);

//     // parse stdout
//     stdout = stdout.split("\r\n")[0];

//     res.json({
//       host,
//       state,
//       command,
//       output: stdout.trim(),
//     });
//   });
// });

module.exports = router;
