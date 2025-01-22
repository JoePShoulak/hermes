import React, { useEffect, useState } from "react";

const defaultStatus = {
  powered: null,
};

export default function Status1(props) {
  const [status, setStatus] = useState(defaultStatus);
  function updateStatus(key, value) {
    setStatus(prevState => ({
      ...prevState,
      [key]: value,
    }));
  }

  const fetchData = async () => {
    console.log("fetching data");
    try {
      const response = await fetch("/api/power/hp1"); // Call the API
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      updateStatus("powered", data);
    } catch (err) {
      console.error("Error fetching status data:", err);
      setError(err.message);
    }
  };

  // Run fetchData on component mount
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>
        <b>{props.target}</b>
      </p>
      <ul>
        <li>Powered: {status.powered == null ? "?" : status.powered}</li>
      </ul>
    </div>
  );
}
