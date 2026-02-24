// App.jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chat list / landing */}
        <Route path="/" element={<HomePage />} />
        <Route path="/landingpage" element={<LandingPage />} />

        {/* Grid view with gridId */}
        <Route path="/grid/:gridId" element={<HomePage />} />

        {/* Chat view with gridId and chatId */}
        <Route path="/chat/:gridId/:chatId" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;