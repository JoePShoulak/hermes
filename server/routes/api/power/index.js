const router = require("express").Router();

const ILO_TIMEOUT = 60000;

// @route   GET api/power
router.get("/all", async (req, res) => {
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

module.exports = router;
