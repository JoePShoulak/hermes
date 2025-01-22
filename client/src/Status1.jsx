import React, { useEffect, useState } from "react";

const defaultStatus = {
  powered: "UNKNOWN",
  stale: false,
};

const getPower = target => {
  const fetchPowerStatus = async () => {
    try {
      const result = await fetch(`/api/power/${target.toLowerCase()}`);

      const data = await result.json();
      return data.status;
    } catch (error) {
      console.error("Error fetching power status:", error);
      return "ERROR";
    }
  };
};

export default function Status1({ target }) {
  const [status, setStatus] = useState(defaultStatus);

  function updateStatus(key, value) {
    const update = value == "UNKNOWN" ? { stale: true } : { [key]: value };

    setStatus({
      ...status,
      ...update,
    });
  }

  useEffect(() => {
    // Fetch power status on component mount

    updateStatus("powered", getPower(target));

    // Periodically fetch power status every 30 seconds
    const interval = setInterval(fetchPowerStatus, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [target]);

  return (
    <div>
      <h1>{target}</h1>
      <h2>Power</h2>
      <ul>
        <li>Powered: {status.powered || "UNKNOWN"}</li>
        <li>
          <button onClick={() => console.log("pressed")}>ON</button>
        </li>
      </ul>
    </div>
  );
}
