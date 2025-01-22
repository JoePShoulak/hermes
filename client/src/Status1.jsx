import React, { useEffect, useState } from "react";

const defaultStatus = {
  powered: "UNKNOWN",
  stale: false,
};

export default function Status1(props) {
  const [status, setStatus] = useState(defaultStatus);

  function updateStatus(key, value) {
    const update = value == "UNKNOWN" ? { stale: true } : { [key]: value };

    setStatus({
      ...status,
      ...update,
    });
  }

  useEffect(() => {
    const fetchPowerStatus = async () => {
      try {
        const result = await fetch(`/api/power/${props.target.toLowerCase()}`);

        const data = await result.json();
        updateStatus("powered", data.status);
      } catch (error) {
        console.error("Error fetching power status:", error);
        updateStatus("powered", "ERROR");
      }
    };

    // Fetch power status on component mount
    fetchPowerStatus();

    // Periodically fetch power status every 30 seconds
    const interval = setInterval(fetchPowerStatus, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [props.target]);

  return (
    <div>
      <h1>{props.target}</h1>
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
