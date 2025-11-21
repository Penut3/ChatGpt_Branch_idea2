import React from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AltRouteIcon from "@mui/icons-material/AltRoute";

export default function SideBar({
  chats,
  selectedIdx,
  onSelect,
  onNewChat,
  onDeleteChat,
  loading,
  onShowBranches
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);

  return (
    <div
      className="sidebar"
      style={{
        width: 230,
        borderRight: "1px solid #ccc",
        padding: "10px",
        position: "fixed",
        height: "100%",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <img src="/crab.png" style={{ height: "80px" }} alt="CrabGPT" />
      </div>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <h1 className="font1" style={{ color: "red" }}>
          CrabGPT
        </h1>
      </div>

      <Button
        variant="contained"
        fullWidth
        onClick={onShowBranches} 
        style={{ backgroundColor: "black", marginBottom: "10px" }}
      >
        BRANCHES <AltRouteIcon style={{ transform: "rotate(90deg)" }} />
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={onNewChat}
        style={{ backgroundColor: "black" }}
      >
        + New Chat
      </Button>

      {loading && <p style={{ marginTop: 10 }}>Loading chats...</p>}

      <List component="nav">
        {chats.map((chat, i) => (
          <ListItem
            button
            key={chat.id || i}
            selected={i === selectedIdx}
            onClick={() => onSelect(i)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <ListItemText
              primary={chat.chatTitle || "Untitled chat"}
              secondary={
                chat.createdAt
                  ? new Date(chat.createdAt).toLocaleString()
                  : null
              }
            />
            {hoveredIdx === i && (
              <IconButton
                edge="end"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(i);
                }}
              >
                <DeleteIcon style={{ width: "16px", height: "16px" }} />
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
}
