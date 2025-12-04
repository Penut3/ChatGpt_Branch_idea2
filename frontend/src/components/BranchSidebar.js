// BranchSidebar.jsx
import React from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import GridViewIcon from "@mui/icons-material/GridView";

export default function BranchSidebar({
  grids,
  onSelectGrid,
  loadingGrids,
  onBackToChats,
  onNewGrid, // called when "create" is clicked
}) {
  const [showNewGridInput, setShowNewGridInput] = React.useState(false);
  const [newGridName, setNewGridName] = React.useState("");

  const handleNewGridClick = () => {
    setShowNewGridInput((prev) => !prev); // toggle the input
  };

  const handleCreateGrid = () => {
    const name = newGridName.trim();
    if (!name) return;

    if (onNewGrid) {
      onNewGrid(name);      // 👈 calls createNewGrid(name) in parent
    }
    setNewGridName("");
    setShowNewGridInput(false);
  };



  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCreateGrid();
    }
  };

  return (
    <div
      className="sidebar"
      style={{
        width: 350,
        padding: "10px",
        position: "fixed",
        height: "100%",
        zIndex: 10,
        overflowY: "auto",
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
        onClick={onBackToChats}
        style={{ backgroundColor: "black", marginBottom: "10px" }}
      >
        regular Chats
      </Button>

      {/* New grid button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleNewGridClick}
        style={{ backgroundColor: "grey", marginBottom: "10px" }}
      >
        new grid <AltRouteIcon style={{ transform: "rotate(90deg)" }} />
      </Button>

      {/* Input field shown when user clicks "new grid" */}
      {showNewGridInput && (
        <div
          style={{
           padding: "10px 16px",
              borderRadius: "6px",
              transition: "0.2s",
              backgroundImage: `
                linear-gradient(to right, rgba(24, 24, 24, 1), rgba(24, 24, 24, 0)),
              `,
              backgroundSize: "20px 20px",
              backgroundColor: "rgba(27, 27, 27, 1)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          
          <input  placeholder="New grid name"
            value={newGridName}
            onChange={(e) => setNewGridName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{border: "none", backgroundColor:"transparent", width:"100%", fontSize:"16px"}}
           autoFocus>
          </input>
          {/* <Button variant="contained" onClick={handleCreateGrid}>
            Create
          </Button> */}
        </div>
      )}

      {loadingGrids && <p>Loading grids...</p>}

      <List>
        {grids.length === 0 && !loadingGrids && (
          <p style={{ padding: "10px" }}>No grids yet</p>
        )}

        {grids.map((grid, i) => (
          <ListItem
            button
            key={grid.id || i}
            onClick={() => onSelectGrid && onSelectGrid(i, grid)}
            sx={{
              "&:hover": {
                cursor: "pointer",
              },
              padding: "10px 16px",
              borderRadius: "6px",
              marginTop:"10px",
              transition: "0.2s",
              backgroundImage: `
                linear-gradient(to right, rgba(24, 24, 24, 1), rgba(24, 24, 24, 0)),
              `,
              backgroundSize: "20px 20px",
              backgroundColor: "rgba(27, 27, 27, 1)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <ListItemText primary={grid.name || `Grid ${i + 1}`} />
            <GridViewIcon />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
