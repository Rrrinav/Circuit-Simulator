import React, { useState, useEffect, useRef } from "react";
import fuse_def from "../assets/fuse_def.svg";
import fuse_sel from "../assets/fuse_sel.svg";
import { Asset } from "../AssetManager";

const Canvastry = () => {
  const canvasRef = useRef(null);
  const [clicked, setClicked] = useState(false);
  const assetRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    assetRef.current = new Asset(position.x, position.y, fuse_def, fuse_sel);

    const handleMouseDown = (event) => {
      if (
        assetRef.current &&
        assetRef.current.isClicked(event.offsetX, event.offsetY)
      ) {
        setClicked(true);
      }
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    const handleMouseMove = (event) => {
      if (clicked) {
        const newX = event.offsetX;
        const newY = event.offsetY;
        setPosition({ x: newX, y: newY });
        assetRef.current.setX(newX);
        assetRef.current.setY(newY);
      }
    };

    // Attach event listeners
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    function mainLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "lightgray";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      assetRef.current.draw(ctx);
      requestAnimationFrame(mainLoop);
    }

    mainLoop();

    // Cleanup event listeners on component unmount
    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [clicked, position]); // `clicked` and `position` are dependencies

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ border: "1px solid black" }}
    />
  );
};

export default Canvastry;
