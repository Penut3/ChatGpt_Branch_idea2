import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";
import BranchSidebar from "../components/BranchSidebar";

export default function HomePage() {
  const [chatHeaders, setChatHeaders] = useState([]);      // sidebar items
  const [selectedIdx, setSelectedIdx] = useState(null);    // index in chatHeaders
  const [history, setHistory] = useState([]);              // full chain for selected chat
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  
  const [showBranches, setShowBranches] = useState(false);
  const [branches, setBranches] = useState([]); // you can fill this later
  const [loadingBranches, setLoadingBranches] = useState(false);

const BACKEND_URL = "https://localhost:7151/api/";
  // Load headers (one per chat chain)
  const loadChats = async () => {
    try {
      setLoadingHeaders(true);
      const res = await fetch(`${BACKEND_URL}chat/ChatHeaders/Latest`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      // data should be an array of something like:
      // { id, chatTitle, createdAt, parentChatId, rootChatId, contextHealth }
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

  // When user clicks a chat in the sidebar
  const handleSelectChat = async (idx) => {
    setSelectedIdx(idx);
    const header = chatHeaders[idx];
    if (!header) return;

    // We assume header.id is the root chat or at least some chat in the chain
    await loadChatChain(header.id);
  };

  // Start a brand new chat (not yet in sidebar)
  const createNewChat = () => {
    setSelectedIdx(null);  // nothing selected in sidebar
    setHistory([]);        // empty conversation
  };

  // TODO: implement delete endpoint if you want server-side delete
  const deleteChat = async (index) => {
    const header = chatHeaders[index];
    if (!header) return;

    // Example: call delete on backend (adjust URL & method)
    try {
      await fetch(`http://localhost:3001/api/chat/${header.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting chat:", err);
    }

    // Refresh headers & clear history if we deleted the selected one
    const newHeaders = chatHeaders.filter((_, i) => i !== index);
    setChatHeaders(newHeaders);

    if (selectedIdx === index) {
      setSelectedIdx(null);
      setHistory([]);
    } else if (selectedIdx > index) {
      setSelectedIdx((prev) => prev - 1);
    }
  };

// HomePage.jsx
const handleSend = async (prompt) => {
  if (!prompt.trim()) return;
  setIsSending(true)
  // Use last message to know parentChatId
  const lastMessage = history[history.length - 1];
  const parentChatId = lastMessage ? lastMessage.chatId : null;

  // 1) Optimistically add the user message with pending AI response
  const tempMessage = {
    prompt,
    response: null,          // no AI response yet
    chatId: null,            // unknown until backend returns
    rootChatId: lastMessage ? lastMessage.rootChatId : null,
    isPending: true,         // custom flag just for UI
  };

  setHistory((prev) => [...prev, tempMessage]);

  // 2) Call backend
  const body = {
    userRequest: prompt,
    parentChatId, // null => new root
  };

  try {
    const res = await fetch(`${BACKEND_URL}chat/CreateChat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const created = await res.json();
    const newRootId = created.rootChatId || created.id;
    setIsSending(false)
    // 3) Update the last pending message with real data from backend
    setHistory((prev) => {
      const copy = [...prev];
      // find last pending message (in case user spam-clicks)
      const idx = [...copy]
        .reverse()
        .findIndex((m) => m.isPending && m.prompt === prompt);

      if (idx === -1) return copy;

      // Because we reversed, need to map index back
      const realIdx = copy.length - 1 - idx;

      copy[realIdx] = {
        prompt: created.userRequest,
        response: created.response,
        chatId: created.id,
        rootChatId: newRootId,
        // no more isPending
      };

      return copy;
    });

    // 4) (Optional but nice) refresh the headers
    await loadChats();
  } catch (err) {
    console.error("Error sending message:", err);

    // Optionally mark the pending message as errored
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


const handleSelectBranch = (index, branch) => {
  console.log("Selected branch:", index, branch);
  // TODO: load a branch chat when you define what a branch is
};


  return (
    <div className="viewport" style={{ display: "flex" }}>
     


        {/* SIDEBAR SWITCHING */}
    {showBranches ? (
      <BranchSidebar
        branches={branches}
        onSelectBranch={handleSelectBranch}
        loadingBranches={loadingBranches}
        onBackToChats={() => setShowBranches(false)}
      />
    ) : (
      <SideBar
        chats={chatHeaders}
        selectedIdx={selectedIdx}
        onSelect={handleSelectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        loading={loadingHeaders}
        onShowBranches={() => setShowBranches(true)}
      />
    )}


      <ChatWindow
        history={history}
        onSend={handleSend}
        loading={isSending}
      />
    </div>
  );
}
