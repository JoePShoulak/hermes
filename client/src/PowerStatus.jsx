import React, { useEffect, useState } from "react";

function PowerStatus() {
  const [powerData, setPowerData] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null); // Track the last update time
  const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed since last update

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
        setLastUpdate(Date.now()); // Set the last update time
      } catch (err) {
        console.error("Error fetching power data:", err);
        setError(err.message);
      }
    }

    fetchData();
  }, []); // Fetch only once when the component mounts

  // Timer to update elapsed time
  useEffect(() => {
    if (lastUpdate) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - lastUpdate) / 1000));
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on component unmount
    }
  }, [lastUpdate]);

  // Format elapsed time into hh:mm:ss
  const formatTime = seconds => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div>
      <h1>Power Status</h1>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <p>Time since last update: {formatTime(elapsedTime)}</p>
      <div>
        {powerData.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Host</th>
                <th>Power Status</th>
                <th>Power Off</th>
                <th>Power On</th>
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
                        handlePowerState(item.host.replace("hp", ""), "off")
                      }>
                      Power Off
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        handlePowerState(item.host.replace("hp", ""), "on")
                      }>
                      Power On
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
