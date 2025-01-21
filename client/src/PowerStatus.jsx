import React, { useEffect, useState } from "react";

function PowerStatus() {
  const [powerData, setPowerData] = useState([]); // Store power data from API
  const [error, setError] = useState(null); // Store errors if API fails

  // Fetch power data from the API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/power/all"); // Call the API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPowerData(data); // Update power data in state
      } catch (err) {
        console.error("Error fetching power data:", err);
        setError(err.message);
      }
    }

    fetchData(); // Initial fetch
  }, []); // Run only once on component mount

  // Function to send power state requests (ON/OFF/RESET)
  async function handlePowerState(hostId, state) {
    try {
      const response = await fetch(`/api/power/hp/${hostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state }), // Pass the state (e.g., ON, OFF, RESET)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Power ${state} for ${hostId} successful:`, result);

      // Refetch power data after sending the request
      const updatedData = await fetch("/api/power/all").then(res => res.json());
      setPowerData(updatedData);
    } catch (err) {
      console.error(`Error sending power ${state} request:`, err);
      alert(`Failed to power ${state} ${hostId}: ${err.message}`);
    }
  }

  return (
    <div>
      <h1>Power Status</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div>
        {powerData.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Host</th>
                <th>Power Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {powerData.map((item, index) => {
                const { host, power } = item; // Extract host and power state
                const hostId = host.replace("hp", ""); // Extract numeric ID from host

                return (
                  <tr key={index}>
                    <td>{host}</td>
                    <td>{power || "Unknown"}</td>
                    <td>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "OFF")}
                        disabled={power === "OFF"} // Disable if already OFF
                      >
                        Power Off
                      </button>
                      <button
                        style={{ marginRight: "10px" }}
                        onClick={() => handlePowerState(hostId, "ON")}
                        disabled={power === "ON"} // Disable if already ON
                      >
                        Power On
                      </button>
                      <button
                        onClick={() => handlePowerState(hostId, "RESET")}
                        disabled={power === "OFF"} // Disable RESET if OFF
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
