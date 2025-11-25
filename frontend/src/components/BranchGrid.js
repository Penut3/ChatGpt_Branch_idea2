import React, { useState, useRef, useEffect } from "react";
import "../styles/Branchgrid.css";

export default function BranchG() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      lastPos.current = { x: e.clientX, y: e.clientY };

      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="grid-wrapper"
      onMouseDown={handleMouseDown}
      // Move the grid by changing the background position
      style={{
        backgroundPosition: `${offset.x}px ${offset.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Example content that also moves with the grid */}
      <div
        className="grid-item"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        Im on the grid
      </div>
    </div>
  );
}
