// BranchGrid.jsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import "../styles/Branchgrid.css";

const COLUMN_WIDTH = 260; // distance between levels (x)
const ROW_HEIGHT = 100;   // distance between rows (y)
const NODE_WIDTH = 200;
const NODE_HEIGHT = 70;

export default function BranchGrid({ chats, onSelectChat }) {
  // --- DRAGGING / PANNING ---
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // only start panning when clicking empty space, not on a node button
    if (e.target.closest(".branch-node")) return;
    setIsDragging(true);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPosRef.current.x;
      const dy = e.clientY - lastPosRef.current.y;
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // --- BUILD TREE + LAYOUT POSITIONS ---
  const { nodes, edges } = useMemo(() => {
    if (!chats || chats.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Map id -> node data + children
    const map = new Map();
    chats.forEach((c) => {
      map.set(c.id, { chat: c, children: [] });
    });

    // Link children
    const roots = [];
    chats.forEach((c) => {
      if (c.parentChatId && map.has(c.parentChatId)) {
        map.get(c.parentChatId).children.push(map.get(c.id));
      } else {
        // no parent => root
        roots.push(map.get(c.id));
      }
    });

    // Sort roots by createdAt to have stable order
    roots.sort(
      (a, b) =>
        new Date(a.chat.createdAt).getTime() -
        new Date(b.chat.createdAt).getTime()
    );

    const positionedNodes = [];
    const edges = [];
    let currentRow = 0;

    const dfs = (node, depth) => {
      const row = currentRow++;
      const x = depth * COLUMN_WIDTH;
      const y = row * ROW_HEIGHT;

      positionedNodes.push({
        id: node.chat.id,
        title: node.chat.chatTitle,
        x,
        y,
        chat: node.chat,
      });

      node.children
        .sort(
          (a, b) =>
            new Date(a.chat.createdAt).getTime() -
            new Date(b.chat.createdAt).getTime()
        )
        .forEach((child) => {
          edges.push({
            from: node.chat.id,
            to: child.chat.id,
          });
          dfs(child, depth + 1);
        });
    };

    roots.forEach((root) => {
      dfs(root, 0);
      // small gap between separate trees
      currentRow += 1;
    });

    return { nodes: positionedNodes, edges };
  }, [chats]);

  // Helper to get node center by id for lines
  const nodeById = useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);
  

  // Compute SVG bounds big enough to hold everything
  const svgWidth =
    (Math.max(0, ...nodes.map((n) => n.x)) || 0) + COLUMN_WIDTH + 200;
  const svgHeight =
    (Math.max(0, ...nodes.map((n) => n.y)) || 0) + ROW_HEIGHT + 200;

  return (
    <div
      className="branch-grid-wrapper"
      onMouseDown={handleMouseDown}
      style={{
        backgroundPosition: `${offset.x}px ${offset.y}px`,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Inner world that moves with offset */}
      <div
        className="branch-grid-world"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        }}
      >
        {/* Connections */}
        <svg
          className="branch-grid-svg"
          width={svgWidth}
          height={svgHeight}
        >
          {edges.map((edge, i) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;

            const x1 = from.x + NODE_WIDTH;
            const y1 = from.y + NODE_HEIGHT / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_HEIGHT / 2;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="branch-grid-edge"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <button
            key={node.id}
            className="branch-node"
            style={{
              left: node.x,
              top: node.y,
              width: NODE_WIDTH,
              height: NODE_HEIGHT,
            }}
            onClick={() => onSelectChat && onSelectChat(node.chat)}
          >
            <div className="branch-node-title">
              {node.title || "(no title)"}
            </div>
            <div className="branch-node-meta">
              {new Date(node.chat.createdAt).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
