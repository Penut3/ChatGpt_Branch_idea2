import React from "react";
import {
  Button,
  List,
  ListItemButton,
  IconButton,
  Collapse,
} from "@mui/material";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import "../styles/SideBar.css";

// Analyze a group of chats belonging to the same root
// nodes: [{ chat, index }]
function analyzeGroup(nodes) {
  if (!nodes || nodes.length === 0) {
    return { isLinear: true, latest: null };
  }

  // childrenCount[id] = how many direct children this node has
  const childrenCount = new Map();

  nodes.forEach(({ chat }) => {
    childrenCount.set(chat.id, 0);
  });

  nodes.forEach(({ chat }) => {
    const parentId = chat.parentChatId;
    if (parentId && childrenCount.has(parentId)) {
      childrenCount.set(parentId, (childrenCount.get(parentId) || 0) + 1);
    }
  });

  // Check shape: at most 1 child per node, exactly 1 leaf
  let leafCount = 0;
  for (const [, count] of childrenCount.entries()) {
    if (count === 0) leafCount += 1;
    if (count > 1) {
      // branching -> not linear
      return { isLinear: false, latest: null };
    }
  }

  const isLinear = leafCount === 1;

  // Latest = node with max createdAt
  let latest = nodes[0];
  nodes.forEach((node) => {
    const t = node.chat.createdAt
      ? new Date(node.chat.createdAt).getTime()
      : 0;
    const lt = latest.chat.createdAt
      ? new Date(latest.chat.createdAt).getTime()
      : 0;
    if (t > lt) latest = node;
  });

  return { isLinear, latest };
}

export default function SideBar({
  chats,
  selectedIdx,
  onSelect,
  onNewChat,
  onDeleteChat, // not used in snippet but kept for API compat
  loading,
  onShowBranches,
}) {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [expandedRoots, setExpandedRoots] = React.useState({});

  // Group chats by rootChatId and analyze each group
  const grouped = React.useMemo(() => {
    if (!chats || chats.length === 0) return [];

    const nodes = chats.map((chat, index) => ({ chat, index }));
    const groupsMap = new Map();

    nodes.forEach(({ chat, index }) => {
      const rootId = chat.rootChatId || chat.id;

      if (!groupsMap.has(rootId)) {
        groupsMap.set(rootId, {
          root: null, // { chat, index }
          children: [], // [{ chat, index }]
          isLinear: false,
          latest: null,
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

    // Sort children by createdAt (newest first) and analyze shape
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

      const allNodes = [group.root, ...group.children].filter(Boolean);
      const { isLinear, latest } = analyzeGroup(allNodes);
      group.isLinear = isLinear;
      group.latest = latest;
    });

    return groupsArr;
  }, [chats]);

  const toggleRoot = (rootId) => {
    setExpandedRoots((prev) => {
      const isCurrentlyExpanded = prev[rootId] ?? true;
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
        onClick={onShowBranches}
        style={{ backgroundColor: "black", marginBottom: "10px" }}
      >
        GRIDS <AltRouteIcon style={{ transform: "rotate(90deg)" }} />
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
          const isExpanded = expandedRoots[rootId] ?? false;

          // LINEAR TREE CASE:
          // there are children but the whole tree is a simple line -> show only latest chat, no dropdown
          if (group.isLinear && hasChildren && group.latest) {
            const { chat, index } = group.latest;
            return (
              <ListItemButton
                key={chat.id}
                selected={selectedIdx === index}
                onClick={() => onSelect(index)}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p>{chat.userRequest}</p>
                  <p className="sidebar-small-text">{chat.chatTitle}</p>
                </div>
              </ListItemButton>
            );
          }

          // DEFAULT BRANCHING CASE: root + collapsible children
          return (
            <React.Fragment key={rootId}>
              <ListItemButton
                selected={selectedIdx === rootIndex}
                onClick={() => onSelect(rootIndex)}
                onMouseEnter={() => setHoveredIdx(rootIndex)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: selectedIdx === rootIndex ? "#222" : "transparent",
    color: selectedIdx === rootIndex ? "white" : "inherit",
                }}
              >
                <div>
                  <p>{rootChat.userRequest}</p>
                  <p className="sidebar-small-text">{rootChat.chatTitle}</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
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
backgroundColor: selectedIdx === index ? "#222" : "transparent",
    color: selectedIdx === index ? "white" : "inherit",
                        }}
                      >
                        <div>
                          <p>{chat.userRequest}</p>
                          <p className="sidebar-small-text">
                            {chat.chatTitle}
                          </p>
                        </div>
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
