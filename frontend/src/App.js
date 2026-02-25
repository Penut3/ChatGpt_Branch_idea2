// App.jsx
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import LandingPage from "./pages/LandingPage";
import RequireAuth from "./components/auth/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chat list / landing */}
        {/* <RequireAuth>
          <Route path="/" element={<HomePage />} />
          <Route path="/grid/:gridId" element={<HomePage />} />
          <Route path="/chat/:gridId/:chatId" element={<HomePage />} />
        </RequireAuth>
         */}

              {/* Protected */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/grid/:gridId"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/chat/:gridId/:chatId"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;