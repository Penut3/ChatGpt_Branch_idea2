// App.jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chat list / landing */}
        <Route path="/" element={<HomePage />} />

        {/* Single chat */}
        <Route path="/chat/:chatId" element={<HomePage />} />

        {/* Grid view – param can be a gridId OR a rootChatId */}
        <Route path="/grid/:gridOrRootId" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
