import React, { useLayoutEffect, useRef, useState } from "react";
import switch_black from "../assets/switch_black.svg"; // Assuming corrected SVG filenames
import switch_red from "../assets/switch_red.svg";

const Canvastry = () => {
  const [imageX, setImageX] = useState(0);
  const [imageY, setImageY] = useState(0);
  const [imageClicked, setImageClicked] = useState(false);
  const [imageColor, setImageColor] = useState("black");
  const canvasRef = useRef(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Load the images
    const imgBlack = new Image();
    const imgRed = new Image();
    imgBlack.src = switch_black;
    imgRed.src = switch_red;

    const drawImage = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "lightgray";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Choose the image based on imageColor state
      const img = imageColor === "black" ? imgBlack : imgRed;

      // Draw the image
      ctx.drawImage(img, imageX, imageY, img.width, img.height);
    };

    imgBlack.onload = drawImage;
    imgRed.onload = drawImage;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        setImageX((prev) => prev + 10);
      } else if (event.key === "ArrowLeft") {
        setImageX((prev) => prev - 10);
      } else if (event.key === "ArrowDown") {
        setImageY((prev) => prev + 10);
      } else if (event.key === "ArrowUp") {
        setImageY((prev) => prev - 10);
      }
    };

    const handleMouseDown = (event) => {
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - canvasRect.left;
      const mouseY = event.clientY - canvasRect.top;

      const img = imageColor === "black" ? imgBlack : imgRed;

      if (
        mouseX > imageX &&
        mouseX < imageX + img.width &&
        mouseY > imageY &&
        mouseY < imageY + img.height
      ) {
        setImageClicked((prev) => !prev);
        setImageColor((prev) => (prev === "black" ? "red" : "black"));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", handleMouseDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("mousedown", handleMouseDown);
    };
  }, [imageX, imageY, imageClicked, imageColor]);

  return (
    <canvas
      ref={canvasRef}
      id="canvas"
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ border: "1px solid black" }}
    ></canvas>
  );
};

export default Canvastry;
