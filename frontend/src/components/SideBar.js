import React from "react";
import {
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function SideBar({
  chats,
  selectedIdx,
  onSelect,
  onNewChat,
  onDeleteChat,
  loading,
  onShowBranches,
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [expandedRoots, setExpandedRoots] = React.useState({});

  // Group chats by rootChatId
  const grouped = React.useMemo(() => {
    if (!chats || chats.length === 0) return [];

    const nodes = chats.map((chat, index) => ({ chat, index }));
    const groupsMap = new Map();

    nodes.forEach(({ chat, index }) => {
      const rootId = chat.rootChatId || chat.id;

      if (!groupsMap.has(rootId)) {
        groupsMap.set(rootId, {
          root: null,   // { chat, index }
          children: [], // [{ chat, index }]
        });
      }

      const group = groupsMap.get(rootId);

      if (chat.id === rootId) {
        group.root = { chat, index };
      } else {
        group.children.push({ chat, index });
      }
    });

    // Fallback: if root is missing, use first child as root
    groupsMap.forEach((group) => {
      if (!group.root && group.children.length > 0) {
        group.root = group.children[0];
        group.children = group.children.slice(1);
      }
    });

    const groupsArr = Array.from(groupsMap.values());

    // Sort roots (newest first)
    groupsArr.sort((a, b) => {
      const aTime = a.root?.chat.createdAt
        ? new Date(a.root.chat.createdAt).getTime()
        : 0;
      const bTime = b.root?.chat.createdAt
        ? new Date(b.root.chat.createdAt).getTime()
        : 0;
      return bTime - aTime;
    });

    // Sort children by createdAt (newest first)
    groupsArr.forEach((group) => {
      group.children.sort((a, b) => {
        const aTime = a.chat.createdAt
          ? new Date(a.chat.createdAt).getTime()
          : 0;
        const bTime = b.chat.createdAt
          ? new Date(b.chat.createdAt).getTime()
          : 0;
        return bTime - aTime;
      });
    });

    return groupsArr;
  }, [chats]);

  const toggleRoot = (rootId) => {
    setExpandedRoots((prev) => {
      const isCurrentlyExpanded = prev[rootId] ?? true; // same default
      return {
        ...prev,
        [rootId]: !isCurrentlyExpanded,
      };
    });
  };

  return (
    <div
      className="sidebar"
      style={{
        width: 350,
        borderRight: "1px solid #ccc",
        padding: "10px",
        position: "fixed",
        height: "100%",
        zIndex: 10,
        overflowY: "auto",
        backgroundColor: "white"
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
        {grouped.map((group) => {
          const rootChat = group.root?.chat;
          const rootIndex = group.root?.index;
          if (!rootChat) return null;

          const rootId = rootChat.rootChatId || rootChat.id;
          const hasChildren = group.children.length > 0;
          const isExpanded = expandedRoots[rootId] ?? false; // default expanded

          return (
            <React.Fragment key={rootId}>
              {/* Root chat row */}
              <ListItemButton
                selected={selectedIdx === rootIndex}
                onClick={() => onSelect(rootIndex)}
                onMouseEnter={() => setHoveredIdx(rootIndex)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <ListItemText
                  primary={rootChat.userRequest || "Root chat"}
                  secondary={rootChat.chatTitle || "Untitled chat"}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Dropdown only if there are children */}
                  {hasChildren && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRoot(rootId);
                      }}
                    >
                      {isExpanded ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </div>
              </ListItemButton>

              {/* Children only if there ARE children */}
              {hasChildren && (
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {group.children.map(({ chat, index }) => (
                      <ListItemButton
                        key={chat.id}
                        selected={selectedIdx === index}
                        onClick={() => onSelect(index)}
                        onMouseEnter={() => setHoveredIdx(index)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        style={{
                          paddingLeft: 32,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <ListItemText
                          primary={chat.userRequest || "Chat"}
                          secondary={chat.chatTitle || "Untitled chat"}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
    </div>
  );
}
