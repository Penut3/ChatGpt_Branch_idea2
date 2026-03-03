import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import BranchSidebar from "../components/BranchSidebar";
import BranchGrid from "../components/BranchGrid";
import { useNavigate, useParams } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const { gridId, chatId } = useParams();
  
  const [chatHeaders, setChatHeaders] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState("chat");

  // Grids state
  const [grids, setGrids] = useState([]);
  const [loadingGrids, setLoadingGrids] = useState(false);
  const [gridChats, setGridChats] = useState([]);
  const [selectedGridId, setSelectedGridId] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_API;


  // =====================
  // INITIAL LOAD based on URL params
  // =====================
  useEffect(() => {
     if (grids.length === 0) {
      loadGrids();
    }

    if (gridId && chatId) {
      // URL:  /chat/:gridId/:chatId -> show chat view
      loadChatChain(chatId);
      setSelectedGridId(gridId);
      setViewMode("chat");
    } else if (gridId) {
      // URL: /grid/:gridId -> show grid view
      loadGridById(gridId);
      setSelectedGridId(gridId);
      setViewMode("grid");
    } else {
      // URL:  / -> default view (could show chat list or landing)
      // loadChats();
      // setViewMode("chat");
    }
  }, [gridId, chatId]);

  // =====================
  // Load all grids
  // =====================
  const loadGrids = async () => {
    try {
      setLoadingGrids(true);
      const res = await fetch(`${BACKEND_URL}grid/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const list = await res.json();
      setGrids(list);
    } catch (err) {
      console.error("Error loading grids:", err);
    } finally {
      setLoadingGrids(false);
    }
  };

  // =====================
  // Load grid by ID
  // =====================
  const loadGridById = async (gId) => {
    try {
      const res = await fetch(`${BACKEND_URL}chat/grid/${gId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      const chats = Array.isArray(data) ? data : (data.chats || []);

      setGridChats(chats);
      setSelectedGridId(gId);
      setViewMode("grid");
      return data;
    } catch (err) {
      console.error("Error loading grid:", err);
    }
  };

  // =====================
  // Load chats (for regular sidebar - commented out when in grid mode)
  // =====================
  const loadChats = async () => {
    try {
      setLoadingHeaders(true);

      const [latestRes, rootRes] = await Promise.all([
        fetch(`${BACKEND_URL}chat/ChatHeaders/Latest`),
        fetch(`${BACKEND_URL}chat/RootChats`)
      ]);

      const latestChats = await latestRes.json();
      const rootChats = await rootRes.json();

      const combined = [...latestChats, ... rootChats];

      setChatHeaders(combined);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoadingHeaders(false);
    }
  };

  // =====================
  // Load full chain for a chat
  // =====================
  const loadChatChain = async (cId) => {
    if (! cId) {
      setHistory([]);
      return;
    }

    try {
      setLoadingChat(true);
      const res = await fetch(`${BACKEND_URL}chat/${cId}`, {
        method: "GET",
        headers:  { "Content-Type": "application/json" },
        credentials: "include",
      });

      const chain = await res.json();

      const mapped = chain.map((c) => ({
        prompt: c.userRequest,
        response: c.response,
        chatId: c.id,
        rootChatId: c.rootChatId,
        gridId: c.gridId ??  null,
      }));

      setHistory(mapped);
    } catch (err) {
      console.error("Error loading chat chain:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  // =====================
  // Create new grid
  // =====================
  const createNewGrid = async (gridName) => {
    try {
      const res = await fetch(`${BACKEND_URL}grid/CreateGrid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: gridName }),
        credentials: "include"
      });

      if (! res.ok) {
        throw new Error("Failed to create grid");
      }

      const created = await res.json();
      setGrids((prev) => [...prev, created]);
      
      // Navigate to the new grid
      navigate(`/grid/${created.id}`);
    } catch (err) {
      console.error("Error creating grid:", err);
    }
  };

  // =====================
  // Handle grid selection from sidebar
  // =====================
  const handleSelectGrid = async (index, grid) => {
    console.log("Selected grid:", grid);
    navigate(`/grid/${grid.id}`);
  };

  // =====================
  // Handle chat selection from grid
  // =====================
  const handleSelectChatFromGrid = (chat) => {
    const gId = selectedGridId || chat.gridId;
    navigate(`/chat/${gId}/${chat.id}`);
  };

  // =====================
  // Create new root chat in grid
  // =====================
  const handleNewRootChat = () => {
    setHistory([]);
    setSelectedIdx(null);
    setViewMode("chat");
    // Stay on same grid URL, just clear history
  };

  // =====================
  // Send message
  // =====================
const handleSend = async (prompt) => {
  if (!prompt.trim()) return;
  setIsSending(true);

  const lastMessage = history[history.length - 1];
  const parentChatId = lastMessage ? lastMessage.chatId : null;

  // 1. Add the user's message and a placeholder for the AI response
  const tempMessage = {
    prompt,
    response: "", // Start empty for streaming
    chatId: null,
    rootChatId: lastMessage ? lastMessage.rootChatId : null,
    isPending: true,
  };

  setHistory((prev) => [...prev, tempMessage]);

  try {
    const res = await fetch(`${BACKEND_URL}chat/CreateChat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "text/plain"
      },
      body: JSON.stringify({
        userRequest: prompt,
        parentChatId,
        gridId: !parentChatId && selectedGridId ? selectedGridId : null,
      }),
      credentials: "include",
    });

    if (!res.ok) throw new Error("Stream request failed");

    // 2. Set up the stream reader
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = "";

    // 3. Read the stream loop
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk (Uint8Array to string)
      const chunk = decoder.decode(value, { stream: true });
      
      // If your backend sends "[DONE]", we can stop or ignore it
      if (chunk.includes("[DONE]")) {
         // Note: In your C# code, the DB ID is generated AFTER the stream.
         // We will handle fetching the final ID in the next step.
         break; 
      }

      accumulatedResponse += chunk;

      // 4. Update the specific message in history with the new text
      setHistory((prev) => {
        const newHistory = [...prev];
        const lastIdx = newHistory.length - 1;
        newHistory[lastIdx] = {
          ...newHistory[lastIdx],
          response: accumulatedResponse,
        };
        return newHistory;
      });
    }

    // 5. Finalizing: The AI is done "typing"
    setIsSending(false);
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[newHistory.length - 1].isPending = false;
      return newHistory;
    });

    // IMPORTANT: Since your C# code saves to the DB AFTER streaming,
    // you might want to refresh the headers/sidebar to get the new Chat ID
    await loadChats();

  } catch (err) {
    console.error("Error sending message:", err);
    setIsSending(false);
    setHistory((prev) => {
      const newHistory = [...prev];
      const lastIdx = newHistory.length - 1;
      newHistory[lastIdx].response = "Error: Could not reach the AI.";
      newHistory[lastIdx].isPending = false;
      return newHistory;
    });
  }
};

  // =====================
  // Branch from message
  // =====================
  const handleBranchFromMessage = (index, message) => {
    if (! history[index]) return;

    const newHistory = history.slice(0, index + 1);
    setHistory(newHistory);
    setSelectedIdx(null);
    setViewMode("chat");
  };

  // =====================
  // Open grid from chat
  // =====================
  const handleOpenGridFromChat = async () => {
    if (!history. length) return;

    const { rootChatId, chatId:  currentChatId, gridId:  currentGridId } = history[0];
    const rootId = rootChatId || currentChatId;

    if (currentGridId) {
      navigate(`/grid/${currentGridId}`);
    } else {
      // If no grid, could navigate to a default or create one
      navigate(`/`);
    }
  };

  // Determine if we're in a grid context (based on URL)
  const isInGridContext = Boolean(gridId);

  return (
    <div className="viewport" style={{ display: "flex" }}>
      {/* LEFT SIDE:  Always show GridSidebar when we have a gridId in URL */}
      {isInGridContext ?  (
        <BranchSidebar
          grids={grids}
          onSelectGrid={handleSelectGrid}
          loadingGrids={loadingGrids}
          onBackToChats={() => navigate("/")}
          onNewGrid={createNewGrid}
        />
      ) : (
        /* Regular chat sidebar - COMMENTED OUT when in grid mode */
        // <SideBar
        //   chats={chatHeaders}
        //   selectedIdx={selectedIdx}
        //   onSelect={handleSelectChat}
        //   onNewChat={createNewChat}
        //   onDeleteChat={deleteChat}
        //   loading={loadingHeaders}
        //   onShowBranches={() => navigate("/grid")} // Or navigate to first grid
        // />
        <BranchSidebar
          grids={grids}
          onSelectGrid={handleSelectGrid}
          loadingGrids={loadingGrids}
          onBackToChats={() => navigate("/")}
          onNewGrid={createNewGrid}
        />
      )}

      {/* RIGHT SIDE:  either chat view or grid view based on URL */}
      {viewMode === "chat" && (
        <ChatWindow
          history={history}
          onSend={handleSend}
          loading={isSending}
          onBranchFromMessage={handleBranchFromMessage}
          onOpenGridFromChat={handleOpenGridFromChat}
        />
      )}

      {viewMode === "grid" && (
        <BranchGrid
          chats={gridChats}
          onSelectChat={handleSelectChatFromGrid}
          onNewRootChat={handleNewRootChat}
        />
      )}
    </div>
  );
}