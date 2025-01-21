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

  // Function to handle power-off requests
  async function handlePowerOff(hostId) {
    try {
      const response = await fetch(`/api/power/hp/${hostId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: "OFF" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Power off for ${hostId} successful:`, result);

      // Optional: Refetch the power status after the action
      const updatedData = await fetch("/api/power/all").then(res => res.json());
      setPowerData(updatedData);
    } catch (err) {
      console.error("Error sending power-off request:", err);
      alert(`Failed to power off ${hostId}: ${err.message}`);
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
              {powerData.map((item, index) => (
                <tr key={index}>
                  <td>{item.host}</td>
                  <td>{item.power || "Unknown"}</td>
                  <td>
                    <button
                      onClick={() =>
                        handlePowerOff(item.host.replace("hp", ""))
                      }>
                      Power Off
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
