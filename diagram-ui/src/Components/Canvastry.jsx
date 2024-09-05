import React, { useEffect, useState, useRef, useCallback } from "react";
import fuse_def from "../assets/fuse_def.svg";
import fuse_sel from "../assets/fuse_sel.svg";
import battery_def from "../assets/battery_def.svg";
import battery_sel from "../assets/battery_sel.svg";
import { Asset, AssetManager } from "../AssetManager";
import { ElementTypes, Board } from "../Board";

const Canvastry = () => {
  // Element that I have currently chosen from options to draw on the board
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const assetManagerRef = useRef(null);

  const handleChange = (event) => {
    console.log("Selected element: ", event.target.value);
    boardRef.current.setSelectedElementToBeDrawn(event.target.value);
  };

  // Initialize board and assets once when the component mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize AssetManager and Board only once
    if (!assetManagerRef.current) {
      assetManagerRef.current = new AssetManager();
      assetManagerRef.current.addAsset(
        ElementTypes.fuse,
        new Asset(fuse_def, fuse_sel),
      );
      assetManagerRef.current.addAsset(
        ElementTypes.battery,
        new Asset(battery_def, battery_sel),
      );

      assetManagerRef.current.loadAll().then(() => {
        console.log("All assets loaded");

        // Initialize the board
        boardRef.current = new Board(canvas, assetManagerRef.current);

        // Event listeners for interaction
        canvas.addEventListener("mousedown", handleMouseDown);
        canvas.addEventListener("mouseup", handleMouseUp);
        canvas.addEventListener("mousemove", handleMouseMove);

        // Main loop to keep redrawing the canvas
        function mainLoop() {
          boardRef.current.draw();
          requestAnimationFrame(mainLoop);
        }
        mainLoop();
      });
    }

    // Cleanup event listeners when the component unmounts
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Handle mouse down, send the currently opted element to the board
  const handleMouseDown = (event) => {
    if (boardRef.current) {
      boardRef.current.handleMouseDown(event);
    }
  };

  const handleMouseUp = (event) => {
    if (boardRef.current) {
      boardRef.current.handleMouseUp(event);
    }
  };

  const handleMouseMove = (event) => {
    if (boardRef.current) {
      boardRef.current.handleMouseMove(event);
    }
  };

  return (
    <>
      <div
        style={{
          padding: "10px",
          backgroundColor: "#ccc",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <input
          type="radio"
          name="shapes"
          value={ElementTypes.fuse}
          id="fuse"
          onChange={handleChange}
          defaultChecked
        />
        <label htmlFor="fuse">FUSE</label>

        <input
          type="radio"
          name="shapes"
          value={ElementTypes.battery}
          id="battery"
          onChange={handleChange}
        />
        <label htmlFor="battery">BATTERY</label>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </>
  );
};

export default Canvastry;
