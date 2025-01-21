import React, { useEffect, useState } from "react";

function PowerStatus() {
  const [powerData, setPowerData] = useState([]);
  const [error, setError] = useState(null);

  // Fetch power data from the API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/power/all"); // Fetch from backend API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPowerData(data);
      } catch (err) {
        console.error("Error fetching power data:", err);
        setError(err.message);
      }
    }

    fetchData();
  }, []); // Run once on component mount

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
                <th>Error Details</th>
              </tr>
            </thead>
            <tbody>
              {powerData.map((item, index) => (
                <tr key={index}>
                  <td>{item.host}</td>
                  <td>{item.power || "N/A"}</td>
                  <td>{item.error || "None"}</td>
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
