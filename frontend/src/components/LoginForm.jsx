import React, { useState } from "react";
import { Button, TextField } from '@mui/material';
import "../styles/LoginForm.css";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
      const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const BACKEND_URL = process.env.REACT_APP_BACKEND_API;

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in both email and password");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}Users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to login");
      }

      const data = await res.json();
      console.log("Logged in user:", data);
      navigate("/")
      
      // TODO: navigate or store token here
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };

  return (
    <div className="login-form">
      <TextField
        label="Email"
        variant="outlined"
        className="small-text-field"
        required                 
        value={email}           
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        variant="outlined"
        className="small-text-field"
        type="password"
        required                 
        value={password}      
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
        <Button
          variant="contained"
          sx={{
            width: "80px",
            backgroundColor: "black",
            fontSize: "12px",
            padding: "4px 8px",
            textTransform: "none",
            color: "white",
          }}
          onClick={handleLogin} 
        >
          Login
        </Button>
      </div>
    </div>
  );
}
