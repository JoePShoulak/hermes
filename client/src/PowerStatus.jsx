import React, { useEffect, useState } from "react";

function PowerStatus() {
  const [powerData, setPowerData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch power data from the API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/power/all"); // Fetch from backend
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPowerData(data); // Save data to state
      } catch (err) {
        console.error("Error fetching power data:", err);
        setError(err.message);
      }
    }

    fetchData();
  }, []); // Run once on component mount

  // Function to handle power state requests (ON/OFF/RESET)
  async function handlePowerState(hostId, state) {
    try {
      const response = await fetch(`/api/power/hp/${hostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Power ${state} for ${hostId} successful:`, result);

      // Optional: Refetch the power status after the action
      const updatedData = await fetch("/api/power/all").then(res => res.json());
      setPowerData(updatedData);
    } catch (err) {
      console.error(`Error sending power ${state} request:`, err);
      alert(`Failed to power ${state} ${hostId}: ${err.message}`);
    }
  }

  // Helper function to check button states
  const isButtonDisabled = (currentStatus, buttonState) => {
    if (currentStatus === "ON" && buttonState === "ON") return true;
    if (
      currentStatus === "OFF" &&
      (buttonState === "OFF" || buttonState === "RESET")
    )
      return true;
    return false; // Enable for UNKNOWN or valid transitions
  };

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
              {powerData.map((item, index) => (
                <tr key={index}>
                  <td>{item.host}</td>
                  <td>{item.power || "Unknown"}</td>
                  <td>
                    <button
                      style={{ marginRight: "10px" }}
                      onClick={() =>
                        handlePowerState(item.host.replace("hp", ""), "OFF")
                      }
                      disabled={isButtonDisabled(item.power, "OFF")}>
                      Power Off
                    </button>
                    <button
                      style={{ marginRight: "10px" }}
                      onClick={() =>
                        handlePowerState(item.host.replace("hp", ""), "ON")
                      }
                      disabled={isButtonDisabled(item.power, "ON")}>
                      Power On
                    </button>
                    <button
                      onClick={() =>
                        handlePowerState(item.host.replace("hp", ""), "RESET")
                      }
                      disabled={isButtonDisabled(item.power, "RESET")}>
                      Power Reset
                    </button>
                  </td>
                </tr>
              ))}
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
