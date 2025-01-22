const router = require("express").Router();
const powerRoutes = require("./power");

router.use("/power", powerRoutes);

const { exec, execSync } = require("child_process"); // <–– Add execSync
const ping = require("ping");

const ILO_TIMEOUT = 60000;

router.get("/power/all", async (req, res) => {
  // IPs here are the OS IPs where you can SSH for docker info.
  // The "name" is the argument used by the `ilo` command.
  const hosts = [
    { name: "hp1", ip: "10.0.20.11" },
    { name: "hp2", ip: "10.0.20.12" },
    { name: "hp3", ip: "10.0.20.13" },
    { name: "hp4", ip: "10.0.20.14" },
  ];
  const commandTimeout = { timeout: ILO_TIMEOUT };

  try {
    // Use Promise.all to execute `ilo` + ping + container checks in parallel
    const results = await Promise.all(
      hosts.map(
        host =>
          new Promise(resolve => {
            const iloCommand = `ilo ${host.name} POWER`;

            exec(iloCommand, commandTimeout, async (error, stdout, stderr) => {
              let statusStatus = "UNKNOWN";
              let reachable = false;
              let containerCount = 0; // Default if unreachable or OFF

              // 1) Parse power status from `ilo` command
              if (!error && !stderr) {
                const match = stdout
                  .split("currently: ")[1]
                  ?.split("\r\n\r\n")[0]
                  ?.trim();
                statusStatus = match || "UNKNOWN";
              } else {
                console.error(
                  `Error executing iLO command for ${host.name}:`,
                  error?.message || stderr
                );
              }

              // 2) Ping the server's OS IP
              try {
                const pingResult = await ping.promise.probe(host.ip);
                reachable = pingResult.alive;
              } catch (pingError) {
                console.error(
                  `Ping failed for ${host.name}:`,
                  pingError.message
                );
              }

              // 3) If the server is ON + reachable, SSH to get container count
              if (reachable && statusStatus.toUpperCase() === "ON") {
                try {
                  // Example Docker command: "docker ps | tail -n +2 | wc -l"
                  // Adjust user (myUser) or command as needed.
                  const dockerCmd = `ssh ${host.name} "sudo docker ps | tail -n +2 | wc -l"`;
                  const dockerOutput = execSync(dockerCmd, { timeout: 5000 });
                  containerCount =
                    parseInt(dockerOutput.toString().trim(), 10) || 0;
                } catch (dockerErr) {
                  console.error(
                    `Docker ps failed for ${host.name}:`,
                    dockerErr.message
                  );
                }
              }

              // 4) Resolve final data for this host
              resolve({
                host: host.name,
                status: statusStatus,
                reachable,
                containers: containerCount,
              });
            });
          })
      )
    );

    // Send the aggregated results as a response
    res.json(results);
  } catch (err) {
    console.error("Error processing /power/all:", err.message);
    res
      .status(500)
      .json({ error: "Failed to retrieve status and container info" });
  }
});

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

// PUT request to power host ON/OFF/RESET
router.put("/power/HP/:id", (req, res) => {
  const host = `hp${req.params.id}`;
  const { state } = req.body; // Extract "state" from the request payload

  if (!state) {
    return res.status(400).json({ error: "Missing 'state' in request body" });
  }

  const command = `ilo ${host} POWER ${state}`; // e.g. "ilo hp2 POWER ON"
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

    res.json({
      host,
      state,
      command,
      output: stdout.trim(),
    });
  });
});

module.exports = router;
