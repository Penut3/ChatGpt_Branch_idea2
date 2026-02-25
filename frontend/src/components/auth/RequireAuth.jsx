// components/RequireAuth.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_API;

export default function RequireAuth({ children }) {
  const [status, setStatus] = useState("loading");
  // loading | authenticated | unauthenticated

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(`${BACKEND_URL}Users/me`, {
            method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        setStatus("unauthenticated");
      }
    }

    checkAuth();
  }, []);

  if (status === "loading") {
    return <div>Checking session…</div>;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}