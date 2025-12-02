import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import BranchSidebar from "../components/BranchSidebar";
import BranchGrid from "../components/BranchGrid";

export default function HomePage() {
  const [chatHeaders, setChatHeaders] = useState([]);      // sidebar items
  const [selectedIdx, setSelectedIdx] = useState(null);    // index in chatHeaders
  const [history, setHistory] = useState([]);              // full chain for selected chat
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState("chat");        // "chat" | "grid"

  // const [branchChats, setBranchChats] = useState([]);     
  // const [showBranches, setShowBranches] = useState(false);
  // const [branches, setBranches] = useState([]);         
  // const [loadingBranches, setLoadingBranches] = useState(false);

  
  // === NEW: grids state ===
  const [showGrids, setShowGrids] = useState(false);
  const [grids, setGrids] = useState([]);          // list of grids in sidebar
  const [loadingGrids, setLoadingGrids] = useState(false);
  const [gridChats, setGridChats] = useState([]);  // chats belonging to selected grid
  const [selectedGridId, setSelectedGridId] = useState(null);

  const BACKEND_URL = "https://localhost:7151/api/";

  // Load headers (one per chat chain)
  const loadChats = async () => {
    try {
      setLoadingHeaders(true);
      const res = await fetch(`${BACKEND_URL}chat/ChatHeaders`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      // data: { id, chatTitle, createdAt, parentChatId, rootChatId, contextHealth, userRequest  }[]
      setChatHeaders(data);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoadingHeaders(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Load full chain for a given chat id (root or any chat in the chain)
  const loadChatChain = async (chatId) => {
    if (!chatId) {
      setHistory([]);
      return;
    }

    try {
      setLoadingChat(true);
      const res = await fetch(`${BACKEND_URL}chat/${chatId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const chain = await res.json(); // array of ChatGetChainDto, sorted root -> latest

      const mapped = chain.map((c) => ({
        prompt: c.userRequest,
        response: c.response,
        chatId: c.id,
        rootChatId: c.rootChatId,
      }));

      setHistory(mapped);
    } catch (err) {
      console.error("Error loading chat chain:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Load all root chats (for branch sidebar)
  // const loadRootBranches = async () => {
  //   try {
  //     setLoadingBranches(true);
  //     const res = await fetch(`${BACKEND_URL}chat/RootChats`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const roots = await res.json();
  //     setBranches(roots);   // branches = root chats
  //   } catch (err) {
  //     console.error("Error loading root branches:", err);
  //   } finally {
  //     setLoadingBranches(false);
  //   }
  // };

  // Load all chats belonging to one root (for grid)
  // const loadBranchTree = async (rootId) => {
  //   try {
  //     const res = await fetch(`${BACKEND_URL}chat/ByRoot/${rootId}`, {
  //       method: "GET",
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const branch = await res.json(); 
     
  //     setBranchChats(branch);
  //     return branch;
  //   } catch (err) {
  //     console.error("Error loading branch tree:", err);
  //   }
  // };


    // =====================
  // NEW: load all grids for BranchSidebar
  // =====================
  const loadGrids = async () => {
    try {
      setLoadingGrids(true);
      // Adjust endpoint name if different (e.g. "grids" or "grid/All")
      const res = await fetch(`${BACKEND_URL}grid/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const list = await res.json();
      setGrids(list); // [{ id, name, ... }, ...]
    } catch (err) {
      console.error("Error loading grids:", err);
    } finally {
      setLoadingGrids(false);
    }
  };



  // =====================
  // NEW: load a single grid (with chats) by id
  // =====================
 const loadGridById = async (gridId) => {
  try {
    const res = await fetch(`${BACKEND_URL}chat/grid/${gridId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    // If backend returns just an array of chats:
    const chats = Array.isArray(data) ? data : (data.chats || []);

    setGridChats(chats);
    setViewMode("grid");
    return data;
  } catch (err) {
    console.error("Error loading grid:", err);
  }
};


  // When user clicks a chat in the normal sidebar
  const handleSelectChat = async (idx) => {
    setSelectedIdx(idx);
    const header = chatHeaders[idx];
    if (!header) return;
    await loadChatChain(header.id);
    setViewMode("chat");
  };

  // When user clicks a node in the grid
  const handleSelectChatFromGrid = (chat) => {
    const idx = chatHeaders.findIndex((h) => h.id === chat.id);
    if (idx !== -1) {
      setSelectedIdx(idx);
    }
    loadChatChain(chat.id);
    setViewMode("chat");
  };

  // Start a brand new chat (not yet in sidebar)
  const createNewChat = () => {
    setSelectedIdx(null);
    setHistory([]);
    setViewMode("chat");
  };

  // Delete chat header (and refresh list) (ikke i bruk)
  const deleteChat = async (index) => {
    const header = chatHeaders[index];
    if (!header) return;

    try {
      await fetch(`http://localhost:3001/api/chat/${header.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting chat:", err);
    }

    const newHeaders = chatHeaders.filter((_, i) => i !== index);
    setChatHeaders(newHeaders);

    if (selectedIdx === index) {
      setSelectedIdx(null);
      setHistory([]);
    } else if (selectedIdx > index) {
      setSelectedIdx((prev) => prev - 1);
    }
  };

  // Branch from a specific message in the chat window
  const handleBranchFromMessage = (index, message) => {
    if (!history[index]) return;

    // Keep messages up to and including this one
    const newHistory = history.slice(0, index + 1);

    // This creates a "new branch view" from that context:
    // - we clear sidebar selection (acts like an ad-hoc branch)
    // - handleSend will use the last message's chatId as parentChatId
    setHistory(newHistory);
    setSelectedIdx(null);
    setViewMode("chat");
  };

  const handleSelectGrid = async (index, grid) => {
  console.log("Selected grid:", grid);
  setSelectedGridId(grid.id);          // ✅ remember the grid
  await loadGridById(grid.id);         // loads chats into BranchGrid
  };

const handleNewRootChat = () => {
  // starting a totally new root chat in this grid
  setHistory([]);
  setSelectedIdx(null);
  setViewMode("chat");
};


 const handleSend = async (prompt) => {
  if (!prompt.trim()) return;
  setIsSending(true);

  const lastMessage = history[history.length - 1];
  const parentChatId = lastMessage ? lastMessage.chatId : null;

  // 🔹 Is this the first message in a new chat?
  const isNewRootChat = !parentChatId;

  // 🔹 Only attach GridId when creating that *first* chat in a grid
  const gridId = isNewRootChat && selectedGridId ? selectedGridId : null;

  const tempMessage = {
    prompt,
    response: null,
    chatId: null,
    rootChatId: lastMessage ? lastMessage.rootChatId : null,
    isPending: true,
  };

  setHistory((prev) => [...prev, tempMessage]);

  const body = {
    userRequest: prompt,
    parentChatId,   // null => new root chain
    gridId,         // 👈 maps to C# GridId
  };

  try {
    const res = await fetch(`${BACKEND_URL}chat/CreateChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const created = await res.json();
    const newRootId = created.rootChatId || created.id;
    setIsSending(false);

    setHistory((prev) => {
      const copy = [...prev];
      const idx = [...copy]
        .reverse()
        .findIndex((m) => m.isPending && m.prompt === prompt);

      if (idx === -1) return copy;

      const realIdx = copy.length - 1 - idx;

      copy[realIdx] = {
        prompt: created.userRequest,
        response: created.response,
        chatId: created.id,
        rootChatId: newRootId,
      };

      return copy;
    });

    await loadChats();
  } catch (err) {
    console.error("Error sending message:", err);

    setHistory((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((m) => m.isPending && m.prompt === prompt);
      if (idx === -1) return copy;

      copy[idx] = {
        ...copy[idx],
        response: "Something went wrong sending this message.",
        isPending: false,
      };

      return copy;
    });
  }
};

  // const handleSelectBranch = async (index, branchRoot) => {
  //   console.log("Selected root branch:", branchRoot);
  //   await loadBranchTree(branchRoot.id);
  //   setViewMode("grid");
  // };

  return (
    <div className="viewport" style={{ display: "flex" }}>
      {/* LEFT SIDE: chat sidebar vs branch sidebar */}
      {showGrids ? (
        <BranchSidebar
          grids={grids}
          onSelectGrid={handleSelectGrid}
          loadingGrids={loadingGrids}
          onBackToChats={() => {
            setShowGrids(false);
            setViewMode("chat");
          }}
          // You can still use this for "create new grid" if you want
          onNewGrid={() => {
            // open a dialog or call a POST /grid here later
          }}
        />
      ) : (
       <SideBar
          chats={chatHeaders}
          selectedIdx={selectedIdx}
          onSelect={handleSelectChat}
          onNewChat={createNewChat}
          onDeleteChat={deleteChat}
          loading={loadingHeaders}
          onShowBranches={() => {
            // Now this button shows GRIDS instead of branches
            setShowGrids(true);
            loadGrids();
          }}
        />
      )}

      {/* RIGHT SIDE: either chat view or grid view */}
      {viewMode === "chat" && (
        <ChatWindow
          history={history}
          onSend={handleSend}
          loading={isSending}
          onBranchFromMessage={handleBranchFromMessage}
        />
      )}

      {viewMode === "grid" && (
        <BranchGrid
          chats={gridChats}               // only this root's tree
          onSelectChat={handleSelectChatFromGrid}
          onNewRootChat={handleNewRootChat} 
        />
      )}
    </div>
  );
}
