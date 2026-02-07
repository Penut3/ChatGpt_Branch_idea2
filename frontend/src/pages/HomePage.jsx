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

  const BACKEND_URL =
    process.env.NODE_ENV === "development"
      ? "https://localhost:7151/api/"
      : "https://backend-test-bxfqebacdegzgdcw.westeurope-01.azurewebsites.net/api/";

  // =====================
  // INITIAL LOAD based on URL params
  // =====================
  useEffect(() => {
    loadGrids(); // Always load grids for the sidebar

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
      loadChats();
      setViewMode("chat");
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
    const parentChatId = lastMessage ?  lastMessage.chatId : null;

    const isNewRootChat = ! parentChatId;
    const currentGridId = isNewRootChat && selectedGridId ? selectedGridId :  null;

    const tempMessage = {
      prompt,
      response: null,
      chatId: null,
      rootChatId: lastMessage ?  lastMessage.rootChatId :  null,
      isPending: true,
    };

    setHistory((prev) => [...prev, tempMessage]);

    const body = {
      userRequest: prompt,
      parentChatId,
      gridId: currentGridId,
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
        const idx = [... copy]
          .reverse()
          .findIndex((m) => m.isPending && m.prompt === prompt);

        if (idx === -1) return copy;

        const realIdx = copy.length - 1 - idx;

        copy[realIdx] = {
          prompt: created.userRequest,
          response: created. response,
          chatId: created.id,
          rootChatId: newRootId,
        };

        return copy;
      });

      // Update URL to show the new chat
      if (selectedGridId) {
        navigate(`/chat/${selectedGridId}/${created.id}`);
      }

      await loadChats();
    } catch (err) {
      console.error("Error sending message:", err);

      setHistory((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => m.isPending && m.prompt === prompt);
        if (idx === -1) return copy;

        copy[idx] = {
          ... copy[idx],
          response: "Something went wrong sending this message.",
          isPending: false,
        };

        return copy;
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