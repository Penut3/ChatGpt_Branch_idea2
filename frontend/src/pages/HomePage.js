import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";

export default function HomePage() {
  const [chatHeaders, setChatHeaders] = useState([]);      // sidebar items
  const [selectedIdx, setSelectedIdx] = useState(null);    // index in chatHeaders
  const [history, setHistory] = useState([]);              // full chain for selected chat
  const [loadingHeaders, setLoadingHeaders] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);


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

  // Send a message
  const handleSend = async (prompt) => {
    if (!prompt.trim()) return;

    // Use last message in history to know parentChatId & rootChatId
    const lastMessage = history[history.length - 1];
    const parentChatId = lastMessage ? lastMessage.chatId : null;
    // const rootChatId = lastMessage ? lastMessage.rootChatId : null;

    // Adjust body shape to match your backend CreateChat endpoint
    const body = {
      userRequest: prompt,
      parentChatId,   // null => new root
      // rootChatId,
    };

    try {
      const res = await fetch(`${BACKEND_URL}chat/CreateChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Assume backend returns created chat dto:
      // { id, userRequest, response, rootChatId, ... }
      const created = await res.json();

      // After sending, reload the full chain using the rootChatId
      const newRootId = created.rootChatId || created.id;
      await loadChatChain(newRootId);

      // Refresh headers so sidebar shows this chat (or updated title)
      await loadChats();

      // If no chat selected yet (new chat), select this one in sidebar
      if (selectedIdx === null) {
        const idx = chatHeaders.findIndex((h) => h.id === newRootId);
        if (idx !== -1) {
          setSelectedIdx(idx);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="viewport" style={{ display: "flex" }}>
      <SideBar
        chats={chatHeaders}
        selectedIdx={selectedIdx}
        onSelect={handleSelectChat}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        loading={loadingHeaders}
      />
      <ChatWindow
        history={history}
        onSend={handleSend}
        loading={loadingChat}
      />
    </div>
  );
}
