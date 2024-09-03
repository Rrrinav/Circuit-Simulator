import React from "react";

const ElementMenu = () => {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#ccc",
        display: "flex",
        justifyContent: "space-around",
      }}
    >
      <input type="radio" name="shapes" value="fuse" defaultChecked />
      <label htmlFor="fuse">FUSE</label>
      <input type="radio" name="shapes" value="resistor" />
      <label htmlFor="resistor">resistor</label>
    </div>
  );
};

export default ElementMenu;
