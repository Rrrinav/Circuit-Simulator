import React, { useEffect, useRef, useState } from "react";
import fuse_def from "../assets/fuse_def.svg";
import fuse_sel from "../assets/fuse_sel.svg";
import battery_def from "../assets/battery_def.svg";
import battery_sel from "../assets/battery_sel.svg";
import resistor_def from "../assets/resistor_def.svg";
import resistor_sel from "../assets/resistor_sel.svg";
import wire_def from "../assets/wire_def.svg";
import wire_sel from "../assets/wire_sel.svg";
import { Asset, AssetManager } from "../AssetManager";
import { ElementTypes, Board } from "../Board";
import "./Canvastry.css";

const Canvastry = () => {
  const canvasRef = useRef(null);
  const boardRef = useRef(null);
  const assetManagerRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(ElementTypes.fuse);

  const handleElementSelect = (element) => {
    setSelectedElement(element);
    boardRef.current.setSelectedElementToBeDrawn(element);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      if (boardRef.current) {
        boardRef.current.updateCanvasSize(canvas.width, canvas.height);
      }
    };

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
      assetManagerRef.current.addAsset(
        ElementTypes.resistor,
        new Asset(resistor_def, resistor_sel),
      );
      assetManagerRef.current.loadAll().then(() => {
        console.log("All assets loaded");
        boardRef.current = new Board(canvas, assetManagerRef.current);
        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);
        document.addEventListener("keydown", (e) => {
          if (e.code == "Space") {
            handleElementSelect(ElementTypes.fuse);
          }
        });

        function mainLoop() {
          boardRef.current.draw();
          requestAnimationFrame(mainLoop);
        }
        mainLoop();
      });
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (boardRef.current) {
        boardRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="canvastry-container">
      <canvas ref={canvasRef} className="circuit-canvas" />
      <div className="elements-menu">
        <h2>Elements</h2>
        <div className="menu-list">
          <div
            className={`menu-item ${selectedElement === ElementTypes.fuse ? "selected" : ""}`}
            onClick={() => handleElementSelect(ElementTypes.fuse)}
          >
            <img
              src={selectedElement === ElementTypes.fuse ? fuse_sel : fuse_def}
              alt="Fuse"
            />
            <span>Fuse</span>
          </div>
          <div
            className={`menu-item ${selectedElement === ElementTypes.battery ? "selected" : ""}`}
            onClick={() => handleElementSelect(ElementTypes.battery)}
          >
            <img
              src={
                selectedElement === ElementTypes.battery
                  ? battery_sel
                  : battery_def
              }
              alt="Battery"
            />
            <span>Battery</span>
          </div>
          <div
            className={`menu-item ${selectedElement === ElementTypes.resistor ? "selected" : ""}`}
            onClick={() => handleElementSelect(ElementTypes.resistor)}
          >
            <img
              src={
                selectedElement === ElementTypes.resistor
                  ? resistor_sel
                  : resistor_def
              }
              alt="resistor"
            />
            <span>Resistor</span>
          </div>
          <div
            className={`menu-item ${selectedElement === ElementTypes.wire ? "selected" : ""}`}
            onClick={() => handleElementSelect(ElementTypes.wire)}
          >
            <img
              src={selectedElement === ElementTypes.wire ? wire_sel : wire_def}
              alt="Wire"
            />
            <span>Wire</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Canvastry;
