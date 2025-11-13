import React from "react";
import { Button, List, ListItem, ListItemText, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AltRouteIcon from '@mui/icons-material/AltRoute';

export default function SideBar({ chats, selectedIdx, onSelect, onNewChat, onDeleteChat }) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  return (
    <div 
      className="sidebar" 
      style={{
        width: 230,
        borderRight: "1px solid #ccc",
        padding: '10px',
        position: 'fixed',
        height: '100%',
        zIndex: 10, // Add this to ensure it's above other elements
      }}
    >
      <div style={{display:'flex', justifyContent:'center', width:'100%'}}>
        <img src="/crab.png" style={{height:'80px'}}/>
      </div>
      <div style={{display:'flex', justifyContent:'center', width:'100%'}} >
        <h1 className="font1" style={{color:'red'}}>CrabGPT</h1>
      </div>
      <Button
        variant="contained"
        fullWidth
        onClick={onNewChat}
        style={{backgroundColor:'black', marginBottom:'10px'}}
      >
        BRANCHES <AltRouteIcon style={{ transform: 'rotate(90deg)' }} /> 
      </Button>

      <Button
        variant="contained"
        fullWidth
        onClick={onNewChat}
        style={{backgroundColor:'black'}}
      >
        + New Chat
      </Button>
      <List component="nav">
        {chats.map((chat, i) => (
           <ListItem
            button
            key={i}
            selected={i === selectedIdx}
            onClick={() => onSelect(i)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <ListItemText primary={chat.title} />
            {hoveredIdx === i && ( // <--- Only show button when hovered!
              <IconButton edge="end" onClick={() => onDeleteChat(i)}>
                <DeleteIcon style={{width:'16px', height:'16px'}}/>
              </IconButton>
            )}
          </ListItem>
        ))}
      </List>
    </div>
  );
}
