import React, { useState, } from "react";
import { Button, TextField } from '@mui/material';
import "../styles/LoginForm.css";
import { useNavigate, Link } from "react-router-dom";

export default function SignUpForm() {
      const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationObjectId, setVerificationObjectId] = useState("");
  const [step, setStep] = useState("signup"); // values: "signup" | "verify"


const BACKEND_URL = process.env.REACT_APP_BACKEND_API;

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      alert("Please fill in both email and password");
      return;
    }

    if (password !== confirmPassword) {
    alert("Passwords must match");
    return;
    }


    try {
      const res = await fetch(`${BACKEND_URL}Users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

     if (!res.ok) {
        const msg = await res.text();
        alert("A user with this email already exist" || "Failed to sign up")
        throw new Error(msg || "Failed to sign up");
        }

      const data = await res.json();
      setVerificationObjectId(data.id)
      setStep("verify"); 

      // console.log("Logged in user:", data);
      // handleLogin(email, password)
      
      // TODO: navigate or store token here
    } catch (err) {
      console.error("Error sign up in:", err);
    }
  };


    const handleVerification = async () => {
    if (!verificationCode) {
      alert("Please fill in field");
      return;
    }

    var id = verificationObjectId;
    var submitCode = verificationCode;

    try {
      const res = await fetch(`${BACKEND_URL}Users/VerifyEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, submitCode }),
        credentials: "include",
      });

     if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to sign up");
        }

      const data = await res.json();
      console.log("Logged in user:", data);
      handleLogin(email, password)
      
      // TODO: navigate or store token here
    } catch (err) {
      console.error("Error logging in:", err);
    }
  };


    const handleLogin = async (email, password) => {

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
      {step === "signup" && (
      <>
        <h1 style={{margin:"0px", fontSize:"20px", color:"black"}}>Signup</h1>
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
      <TextField
          label="Comfirm-Password"
          variant="outlined"
          className="small-text-field"
          type="password"
          required                 
          value={confirmPassword}      
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

      <div style={{ display: "flex"}}>
        <Button
          variant="contained"
          sx={{
            width: "100%",
            backgroundColor: "black",
            fontSize: "12px",
            padding: "4px 8px",
            textTransform: "none",
            color: "white",
          }}
          onClick={handleSignUp} 
        >
          Sign up
        </Button>
    
      </div>
      <div style={{display:"flex", flexDirection:"row", paddingBottom:"10px"}}>
            <p style={{color:"grey", fontSize:"10px", marginRight:"5px"}}>Already have an existing account?</p>
            <Link to="/login" style={{color:"grey", fontSize:"10px"}} >Login</Link>
      </div>
       </>
        )}

         {step === "verify" && (
      <>
        <h1 style={{margin:"0px", fontSize:"20px", color:"black"}}>
          Verify Email
        </h1>

        <TextField
          label="Verification Code"
          variant="outlined"
          className="small-text-field"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />

        <Button onClick={handleVerification}>
          Verify Email
        </Button>
      </>
    )}
    </div>
       
  );
}
