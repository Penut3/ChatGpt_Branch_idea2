import React, { useState, } from "react";
import { Button, TextField } from '@mui/material';
import { LoadingButton } from "@mui/lab";
import "../styles/LoginForm.css";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
      const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const BACKEND_URL = process.env.REACT_APP_BACKEND_API;

const handleLogin = async () => {
  if (!email || !password) {
    alert("Please fill in both email and password");
    return;
  }

  setLoading(true);

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
    navigate("/");
  } catch (err) {
    console.error("Error logging in:", err);
    alert("Error occured please try again")
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-form">
        <h1 style={{margin:"0px", fontSize:"20px", color:"black"}}>Login</h1>
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

      <div style={{ display: "flex"}}>
     <LoadingButton
        variant="contained"
        loading={loading}
        onClick={handleLogin}
        sx={{
          width: "100%",
          backgroundColor: "black",
          fontSize: "12px",
          padding: "4px 8px",
          textTransform: "none",
          color: "white",
        }}
      >
        Login
      </LoadingButton>
          
      </div>
      <div style={{display:"flex", flexDirection:"row", paddingBottom:"10px"}}>
            <p style={{color:"grey", fontSize:"10px", marginRight:"5px"}}>Or create an account</p>
            <Link to="/signup" style={{color:"grey", fontSize:"10px"}} >Sign up</Link>
        </div>
    </div>
  );
}
