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

        {/* Grid view with gridId */}
        <Route path="/grid/:gridId" element={<HomePage />} />

        {/* Chat view with gridId and chatId */}
        <Route path="/chat/:gridId/:chatId" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;