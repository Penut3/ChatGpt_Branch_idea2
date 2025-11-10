import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import ChatWindow from "../components/ChatWindow";

const STORAGE_KEY = "my_chatgpt_chats";

export default function HomePage() {
  // Load from localStorage or start with one empty chat
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : [{ title: "New Chat", history: [] }];
  });
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Persist chats to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  // Create a brand‐new chat
  const createNewChat = () => {
    setChats((prev) => [...prev, { title: "New Chat", history: [] }]);
    setSelectedIdx(chats.length); // new chat is last one
  };

  //t
  // Delete a chat
  const deleteChat = (index) => {
    const updatedChats = chats.filter((_, i) => i !== index);
    setChats(updatedChats);
    if (selectedIdx === index) {
      setSelectedIdx(updatedChats.length > 0 ? 0 : null); // Reset to first chat, or null if no chats remain
    }
  };

  // Send a prompt to your API, update the history, and—on the very first exchange—set the title
  const handleSend = async (prompt) => {
  if (!prompt.trim()) return;

  const chat = chats[selectedIdx];
  
  const messages = [
    {
      role: "system",
      content: "asistant"
    },
    ...chat.history.flatMap(pair => [
      { role: "user", content: pair.prompt },
      { role: "assistant", content: pair.response }
    ]),
    { role: "user", content: prompt }
  ];

  const res = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const { response } = await res.json();

  setChats((prev) => {
    const copy = [...prev];
    const chat = { ...copy[selectedIdx] };

    chat.history = [...chat.history, { prompt, response }];

    if (copy[selectedIdx].history.length === 0) {
      const first4 = prompt.split(/\s+/).slice(0, 4).join(" ");
      chat.title = first4 || "Chat";
    }

    copy[selectedIdx] = chat;
    return copy;
  });
};


  return (
    <div className="viewport" style={{ display: "flex" }}>
      <SideBar
        chats={chats}
        selectedIdx={selectedIdx}
        onSelect={setSelectedIdx}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat} // Pass delete function to SideBar
      />
      {chats.length > 0 && (
        <ChatWindow
          history={chats[selectedIdx].history}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
