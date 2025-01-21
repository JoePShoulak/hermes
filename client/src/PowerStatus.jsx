import React, { useEffect, useState } from "react";

function PowerStatus() {
  const [powerData, setPowerData] = useState([]); // Store power data from API
  const [error, setError] = useState(null); // Store errors if API fails
  const [lastUpdate, setLastUpdate] = useState(null); // Track last update time
  const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed since last update

  // Fetch power data from the API
  const fetchData = async () => {
    try {
      const response = await fetch("/api/power/all"); // Call the API
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPowerData(
        data.map(item => ({
          ...item,
          power: item.power?.toUpperCase() || "UNKNOWN", // Normalize power state
        }))
      ); // Update power data in state
      setLastUpdate(Date.now()); // Update the last update time
    } catch (err) {
      console.error("Error fetching power data:", err);
      setError(err.message);
    }
  };

  // Run fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []); // Run only once on component mount

  // Timer to update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        setElapsedTime(Math.floor((Date.now() - lastUpdate) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [lastUpdate]);

  // Format elapsed time into hh:mm:ss
  const formatElapsedTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h1>Power Status</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <p>
        Last update:{" "}
        {lastUpdate
          ? `${formatElapsedTime(elapsedTime)} ago`
          : "No updates yet"}
      </p>
      <div>
        {powerData.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Host</th>
                <th>Power Status</th>
                <th>LED</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {powerData.map((item, index) => {
                const { host, power, reachable } = item; // Extract host, power, and reachable
                const hostId = host.replace("hp", ""); // Extract numeric ID from host

                // Determine LED color based on power and reachable state
                const getLedColor = () => {
                  if (reachable) return "green";
                  switch (power) {
                    case "ON":
                      return "yellow";
                    case "OFF":
                      return "red";
                    case "UNKNOWN":
                    default:
                      return "black";
                  }
                };

                return (
                  <tr key={index}>
                    <td>{host}</td>
                    <td>{power}</td>
                    <td>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: getLedColor(),
                          margin: "auto",
                        }}></div>
                    </td>
                    <td>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "OFF")}
                        disabled={power === "OFF" || power === "UNKNOWN"} // Disable if OFF or UNKNOWN
                      >
                        Power Off
                      </button>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "ON")}
                        disabled={power === "ON" || power === "UNKNOWN"} // Disable if ON or UNKNOWN
                      >
                        Power On
                      </button>
                      <button
                        onClick={() => handlePowerState(hostId, "RESET")}
                        disabled={power === "OFF" || power === "UNKNOWN"} // Disable RESET if OFF or UNKNOWN
                      >
                        Power Reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>Loading power status...</p>
        )}
      </div>
    </div>
  );
}

export default PowerStatus;
