// BranchSidebar.jsx
import React from "react";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";

export default function BranchSidebar({
  branches,
  onSelectBranch,
  loadingBranches,
  onBackToChats,
  onShowGrid, // called when "new grid" is clicked
}) {
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
        backgroundColor: "white",
      }}
    >
      {/* You can keep your logo/title here if you had them before */}

      <Button
        variant="contained"
        fullWidth
        onClick={onBackToChats}
        style={{ backgroundColor: "black", marginBottom: "10px" }}
      >
        regular Chats
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={onShowGrid}
        style={{ backgroundColor: "grey", marginBottom: "10px" }}
      >
        new grid <AltRouteIcon style={{ transform: "rotate(90deg)" }} />
      </Button>

      {loadingBranches && <p>Loading branches...</p>}

      <List>
        {branches.length === 0 && !loadingBranches && (
          <p style={{ padding: "10px" }}>No branches yet</p>
        )}

        {branches.map((branch, i) => (
          <ListItem
            button
            key={branch.id || i}
            onClick={() => onSelectBranch && onSelectBranch(i, branch)}
          >
            <ListItemText primary={branch.chatTitle || `Root ${i + 1}`} />

          </ListItem>
        ))}
      </List>
    </div>
  );
}
