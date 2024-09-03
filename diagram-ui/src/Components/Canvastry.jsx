import React, { useEffect, useState, useRef } from "react";
import ElementMenu from "./ElementMenu";
import fuse_def from "../assets/fuse_def.svg";
import fuse_sel from "../assets/fuse_sel.svg";
import battery_def from "../assets/battery_def.svg";
import battery_sel from "../assets/battery_sel.svg";
import { Asset, AssetManager } from "../AssetManager";
import { ElementTypes, Element, Board } from "../Board";

const Canvastry = () => {
  // Element that I have currently chosen from options to draw on board
  const [optedElement, setOpetedElement] = useState(ElementTypes.fuse);
  const canvasRef = useRef(null);
  const assetRef = useRef(null);
  const boardRef = useRef(null);
  const assetManagerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    //const ctx = canvas.getContext("2d");

    // Asset Loading
    assetManagerRef.current = new AssetManager();
    assetManagerRef.current.addAsset(ElementTypes.fuse  ,new Asset(fuse_def, fuse_sel));
    assetManagerRef.current.addAsset(ElementTypes.battery  ,new Asset(battery_def, battery_sel));
    assetManagerRef.current.loadAll().then(() => {
      console.log("All assets loaded");
    });

    boardRef.current = new Board(canvas, assetManagerRef.current);
    boardRef.current.addElement(
      new Element(0, 0, ElementTypes.fuse, assetManagerRef.current.getAsset(ElementTypes.fuse))
    );

    const boardInstance = boardRef.current;

    canvas.addEventListener("mousedown", (event) => {
      boardInstance.handleMouseDown(event, optedElement);
    });
    canvas.addEventListener("mouseup", boardInstance.handleMouseUp);
    canvas.addEventListener("mousemove", boardInstance.handleMouseMove);

    function mainLoop() {
      boardInstance.draw();
      requestAnimationFrame(mainLoop);
    }
    mainLoop();

    // Cleanup event listeners on component unmount
    return () => {
      canvas.removeEventListener("mousedown", boardInstance.handleMouseDown);
      canvas.removeEventListener("mouseup", boardInstance.handleMouseUp);
      canvas.removeEventListener("mousemove", boardInstance.handleMouseMove);
    };
  }, []);

  return (
    <>
      <ElementMenu />
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </>
  );
};

export default Canvastry;
