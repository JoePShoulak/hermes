const router = require("express").Router();
const powerRoutes = require("./power");

router.use("/power", powerRoutes);

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
