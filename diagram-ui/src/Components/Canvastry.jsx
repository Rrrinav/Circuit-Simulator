import React, { useEffect, useRef } from "react";
import fuse_def from "../assets/fuse_def.svg";
import fuse_sel from "../assets/fuse_sel.svg";
import { Asset, AssetManager } from "../AssetManager";
import { ElementTypes, Element, Board } from "../Board";

const Canvastry = () => {
  const canvasRef = useRef(null);
  const assetRef = useRef(null);
  const boardRef = useRef(null);
  const assetManagerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    assetRef.current = new Asset(0, 0, fuse_def, fuse_sel);
    assetManagerRef.current = new AssetManager();
    boardRef.current = new Board(canvas, assetManagerRef.current);
    boardRef.current.addElement(
      new Element(0, 0, ElementTypes.fuse, assetRef.current),
    );

    const boardInstance = boardRef.current;

    canvas.addEventListener("mousedown", boardInstance.handleMouseDown);
    canvas.addEventListener("mouseup", boardInstance.handleMouseUp);
    canvas.addEventListener("mousemove", boardInstance.handleMouseMove);

    function mainLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "lightgray";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default Canvastry;
