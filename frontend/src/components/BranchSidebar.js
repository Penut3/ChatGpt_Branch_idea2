// BranchSidebar.jsx
import React from "react";
import { Button, List, ListItem, ListItemText } from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import GridViewIcon from '@mui/icons-material/GridView';

export default function BranchSidebar({
  grids,
  onSelectGrid,
  loadingGrids,
  onBackToChats,
  onNewGrid, // called when "new grid" is clicked
}) {
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

      <Button
        variant="contained"
        fullWidth
        onClick={onNewGrid}
        style={{ backgroundColor: "grey", marginBottom: "10px" }}
      >
        new grid <AltRouteIcon style={{ transform: "rotate(90deg)" }} />
      </Button>

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
        transition: "0.2s",
         backgroundImage: `
          linear-gradient(to right, rgba(24, 24, 24, 1), rgba(24, 24, 24, 0)),
            
          `,
          backgroundSize: "20px 20px",
          backgroundColor: "rgba(27, 27, 27, 1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)"
          
      }}
          >
            
            <ListItemText primary={grid.name || `Grid ${i + 1}`} />
            <GridViewIcon/>
          </ListItem>
        ))}
      </List>
    </div>
  );
}
