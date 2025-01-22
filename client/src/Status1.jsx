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
