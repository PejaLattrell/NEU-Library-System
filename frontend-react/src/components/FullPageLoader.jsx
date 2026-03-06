import React from "react";

function FullPageLoader({ label = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "#334155",
        fontWeight: 600
      }}
    >
      {label}
    </div>
  );
}

export default FullPageLoader;
