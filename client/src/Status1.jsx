import React, { useEffect, useState } from "react";

const defaultStatus = {
  powered: "UNKNOWN",
};

export default function Status1(props) {
  const [status, setStatus] = useState(defaultStatus);

  function updateStatus(key, value) {
    setStatus(prevState => ({
      ...prevState,
      [key]: value,
    }));
  }

  useEffect(() => {
    const fetchPowerStatus = async () => {
      try {
        const result = await fetch(`/api/get-power-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: `ilo ${props.target} power` }),
        });

        const data = await result.json();
        updateStatus("powered", data.output);
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
      <p>
        <b>{props.target}</b>
      </p>
      <ul>
        <li>Powered: {status.powered}</li>
      </ul>
    </div>
  );
}
