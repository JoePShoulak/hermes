import React, { useState, useEffect } from "react";

export default Status1 = () => {
  const [status, setStatus] = useState({ powered: null });

  useEffect(() => {
    const fetchPowerStatus = async () => {
      try {
        const result = await fetch(`/api/get-power-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "ilo hp1 power" }),
        });

        const data = await result.json();
        setStatus(prevStatus => ({ ...prevStatus, powered: data.output }));
      } catch (error) {
        console.error("Error fetching power status:", error);
      }
    };

    // Fetch power status on component mount
    fetchPowerStatus();

    // Set interval to fetch periodically (e.g., every 30 seconds)
    const interval = setInterval(fetchPowerStatus, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>
        Power Status: {status.powered !== null ? status.powered : "Loading..."}
      </h1>
    </div>
  );
};
