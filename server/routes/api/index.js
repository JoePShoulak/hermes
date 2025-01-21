const router = require("express").Router();
const { exec } = require("child_process");

const ILO_TIMEOUT = 30000;

router.get("/power/all", async (req, res) => {
  const hosts = ["hp1", "hp2", "hp3", "hp4"]; // Define the hosts
  const commandTimeout = { timeout: ILO_TIMEOUT };

  try {
    // Use Promise.all to execute `ilo` commands for all hosts
    const results = await Promise.all(
      hosts.map(
        host =>
          new Promise(resolve => {
            const command = `ilo ${host} power`;

            exec(command, commandTimeout, (error, stdout, stderr) => {
              if (error || stderr) {
                console.error(
                  `Error executing command for ${host}:`,
                  error.message || stderr
                );
                return resolve({
                  host,
                  error: `Failed to run command for ${host}`,
                  details: error.message || stderr,
                });
              }

              // Parse stdout
              const powerStatus =
                stdout.split("currently: ")[1]?.split("\r\n\r\n")[0]?.trim() ||
                "Unknown";

              resolve({
                host,
                power: powerStatus,
              });
            });
          })
      )
    );

    // Send the aggregated results as a response
    res.json(results);
  } catch (err) {
    console.error("Error processing /power/all:", err.message);
    res.status(500).json({ error: "Failed to retrieve power statuses" });
  }
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
  const host = `hp${req.params.id}`;
  const { state } = req.body; // Extract "state" from the request payload

  if (!state) {
    return res.status(400).json({ error: "Missing 'state' in request body" });
  }

  const command = `ilo ${host} power ${state}`; // Build the command
  console.log(`Running command: ${command}`);

  exec(command, { timeout: ILO_TIMEOUT }, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(
        `Error executing command for ${host}:`,
        error.message || stderr
      );
      return res.status(500).json({
        error: `Failed to execute command for ${host}`,
        details: error.message || stderr,
      });
    }

    // parse stdout
    stdout = stdout.split("\r\n")[0];

    // Parse and return the command output
    res.json({
      host,
      state,
      command,
      output: stdout.trim(),
    });
  });
});

module.exports = router;
