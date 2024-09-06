import React, { useEffect, useRef } from "react";

const MainCanvas = ({ gridSize = 50 }) => {
  const canvasRef = useRef(null);
  const scaleRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrid();
    };

    const drawGrid = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(panOffsetRef.current.x, panOffsetRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);

      ctx.strokeStyle = "#9f9f9f";
      ctx.lineWidth = 1 / scaleRef.current;

      const gridStartX =
        Math.floor(-panOffsetRef.current.x / scaleRef.current / gridSize) *
        gridSize;
      const gridStartY =
        Math.floor(-panOffsetRef.current.y / scaleRef.current / gridSize) *
        gridSize;
      const gridEndX = gridStartX + width / scaleRef.current + gridSize;
      const gridEndY = gridStartY + height / scaleRef.current + gridSize;

      for (let x = gridStartX; x <= gridEndX; x += gridSize) {
        for (let y = gridStartY; y <= gridEndY; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x - 5, y);
          ctx.lineTo(x + 5, y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, y - 5);
          ctx.lineTo(x, y + 5);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = 1.01;
      const newScale =
        e.deltaY < 0
          ? scaleRef.current * zoomFactor
          : scaleRef.current / zoomFactor;

      const mouseX = e.clientX - canvas.offsetLeft;
      const mouseY = e.clientY - canvas.offsetTop;

      panOffsetRef.current.x -= mouseX / scaleRef.current - mouseX / newScale;
      panOffsetRef.current.y -= mouseY / scaleRef.current - mouseY / newScale;

      scaleRef.current = newScale;
      drawGrid();
    };

    window.addEventListener("resize", updateCanvasSize);
    canvas.addEventListener("wheel", handleWheel);

    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        panOffsetRef.current = { x: 0, y: 0 };
        scaleRef.current = 1;
        drawGrid();
      }
    });

    updateCanvasSize();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      canvas.removeEventListener("wheel", handleWheel); 
    };
  }, [gridSize]);

  return <canvas ref={canvasRef} style={{ wiidth: "100%", height: "100%" }} />;
};

export default MainCanvas;
