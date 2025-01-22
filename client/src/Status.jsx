import React, { useEffect, useState } from "react";

const defaultState = {
  status: [],
  error: null,
  lastUpdate: null,
  elapsedTime: 0,
};

function Status() {
  const [statusData, setStatusData] = useState([]); // Store status data from API
  const [error, setError] = useState(null); // Store errors if API fails
  const [lastUpdate, setLastUpdate] = useState(null); // Track last update time
  const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed since last update

  const [systemState, setSytemState] = useState(defaultState);
  function updateSytemState(key, value) {
    setSytemState(prevState => ({
      ...prevState,
      [key]: value,
    }));
  }

  // updateSystemState('elapsedTime', 100)

  // Fetch status data from the API
  const fetchData = async () => {
    try {
      const response = await fetch("/api/status/all"); // Call the API
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Normalize the data, ensuring status and containers properties
      const normalizedData = data.map(item => ({
        ...item,
        status: item.status?.toUpperCase() || "UNKNOWN",
        containers: item.containers ?? 0, // Default to 0 if not provided
      }));

      setStatusData(normalizedData);
      setLastUpdate(Date.now()); // Update the last update time
      setError(null);
    } catch (err) {
      console.error("Error fetching status data:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Run fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Timer to update elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdate) {
        setElapsedTime(Math.floor((Date.now() - lastUpdate) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Function to send status state requests (ON/OFF/RESET)
  const handlePowerState = async (hostId, state) => {
    // Instantly update the local state to show UNKNOWN for the clicked host
    setStatusData(prevData =>
      prevData.map(item =>
        item.host.replace("hp", "") === hostId
          ? { ...item, status: "UNKNOWN" }
          : item
      )
    );

    try {
      const response = await fetch(`/api/status/hp/${hostId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }), // Pass the state (e.g., ON, OFF, RESET)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Power ${state} for ${hostId} successful:`, result);

      // Refetch status data after sending the request
      const updatedData = await fetch("/api/status/all").then(res =>
        res.json()
      );

      const normalizedData = updatedData.map(item => ({
        ...item,
        status: item.status?.toUpperCase() || "UNKNOWN",
        containers: item.containers ?? 0,
      }));

      setStatusData(normalizedData);
      setLastUpdate(Date.now());
    } catch (err) {
      console.error(`Error sending status ${state} request:`, err);
      alert(`Failed to status ${state} ${hostId}: ${err.message}`);
    }
  };

  // Format elapsed time into hh:mm:ss
  const formatElapsedTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h1>Status</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <p>
        Last update:{" "}
        {lastUpdate
          ? `${formatElapsedTime(elapsedTime)} ago`
          : "No updates yet"}
      </p>

      <div>
        {statusData.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Host</th>
                <th>Power Status</th>
                <th>Online</th>
                <th>LED</th>
                <th>Containers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item, index) => {
                const { host, status, reachable, containers } = item;
                const hostId = host.replace("hp", "");

                // Determine LED color based on status and reachable state
                const getStatusLedColor = () => {
                  if (reachable) return "green"; // Green if online
                  switch (status) {
                    case "ON":
                      return "yellow";
                    case "OFF":
                      return "red";
                    default:
                      return "black";
                  }
                };

                // LED for container count: blue if > 1, otherwise gray
                const getContainerLedColor = () => {
                  return containers > 0 ? "blue" : "gray";
                };

                return (
                  <tr key={index}>
                    <td>{host.toUpperCase()}</td>
                    <td>{status}</td>
                    <td>{reachable ? "Yes" : "No"}</td>
                    <td>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: getStatusLedColor(),
                          margin: "auto",
                        }}
                      />
                    </td>
                    <td>
                      {containers}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: getContainerLedColor(),
                          display: "inline-block",
                          marginLeft: "8px",
                        }}
                      />
                    </td>
                    <td>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "OFF")}
                        disabled={status === "OFF" || status === "UNKNOWN"}>
                        Power Off
                      </button>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "ON")}
                        disabled={status === "ON" || status === "UNKNOWN"}>
                        Power On
                      </button>
                      <button
                        onClick={() => handlePowerState(hostId, "RESET")}
                        disabled={status === "OFF" || status === "UNKNOWN"}>
                        Power Reset
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>Loading status data...</p>
        )}
      </div>
    </div>
  );
}

export default Status;
