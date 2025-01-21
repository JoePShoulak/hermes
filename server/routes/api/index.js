const router = require("express").Router();
const { exec } = require("child_process");
const ping = require("ping");

const ILO_TIMEOUT = 60000;

router.get("/status/all", async (req, res) => {
  const hosts = [
    { name: "hp1", ip: "10.0.20.11" },
    { name: "hp2", ip: "10.0.20.12" },
    { name: "hp3", ip: "10.0.20.13" },
    { name: "hp4", ip: "10.0.20.14" },
  ]; // Define the hosts with their IPs
  const commandTimeout = { timeout: ILO_TIMEOUT };

  try {
    // Use Promise.all to execute `ilo` commands and ping checks for all hosts
    const results = await Promise.all(
      hosts.map(
        host =>
          new Promise(resolve => {
            const command = `ilo ${host.name} POWER`;

            exec(command, commandTimeout, async (error, stdout, stderr) => {
              let statusStatus = "UNKNOWN";
              let reachable = false;

              // Parse the status status from `ilo` command
              if (!error && !stderr) {
                statusStatus =
                  stdout
                    .split("currently: ")[1]
                    ?.split("\r\n\r\n")[0]
                    ?.trim() || "UNKNOWN";
              } else {
                console.error(
                  `Error executing command for ${host.name}:`,
                  error?.message || stderr
                );
              }

              // Perform a ping check
              try {
                const pingResult = await ping.promise.probe(host.ip);
                reachable = pingResult.alive;
              } catch (pingError) {
                console.error(
                  `Ping failed for ${host.name}:`,
                  pingError.message
                );
              }

              resolve({
                host: host.name,
                status: statusStatus,
                reachable,
              });
            });
          })
      )
    );

    // Send the aggregated results as a response
    res.json(results);
  } catch (err) {
    console.error("Error processing /status/all:", err.message);
    res.status(500).json({ error: "Failed to retrieve status statuses" });
  }
});

router.get("/status/HP/:id", (req, res) => {
  const host = `hp${req.params.id}`;
  const command = `ilo ${host} POWER`; // Build the command

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

    // Send the command output as a JSON response
    res.json({
      host,
      status: stdout.trim(),
    });
  });
});

router.put("/status/HP/:id", (req, res) => {
  const host = `hp${req.params.id}`;
  const { state } = req.body; // Extract "state" from the request payload

  if (!state) {
    return res.status(400).json({ error: "Missing 'state' in request body" });
  }

  const command = `ilo ${host} POWER ${state}`; // Build the command
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

    console.log(`- no errors (${host})`);

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
