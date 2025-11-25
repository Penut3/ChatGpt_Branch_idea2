// ChatWindow.jsx
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import TurnLeftIcon from '@mui/icons-material/TurnLeft';
import Tooltip from "@mui/material/Tooltip";

export default function ChatWindow({ history, onSend, loading, onBranchFromMessage }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <div className="ai-section" style={{ marginLeft: 230, width: "100%" }}>
      <div className="output-section">
        {history.length === 0 ? (
          <p>Empty chat</p>
        ) : (
          history.map((item, index) => (
            <div key={index} style={{ marginBottom: "20px", position: "relative" }}>
              {/* USER PROMPT */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: "20px",
                  paddingBottom: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "var(--grey)",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                >
                  {item.prompt}
                </div>
              </div>

              {/* RESPONSE HEADER + BRANCH BUTTON */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "10px",
                  gap: "8px",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Response:</div>

               
              </div>

              {/* RESPONSE BODY */}
              <div style={{ marginTop: "6px" }}>
                <ReactMarkdown>{item.response || ""}</ReactMarkdown>
              </div>
                 {onBranchFromMessage &&
    item.chatId &&
    item.response &&
    !item.isPending &&
    index !== history.length - 1 && (
      <Tooltip title="Branch from this message">
      <Button
        size="small"
        variant="outlined"
        onClick={() => onBranchFromMessage(index, item)}
        style={{
          position: "absolute",
          top: "100%",
          right: "-40px",       // 👈 distance from right edge of response bubble
          transform: "translateY(-50%)",
          fontSize: "10px",
          padding: "2px",
          textTransform: "none",
          minWidth: "28px",    
          width: "28px",       
          height: "28px",       
          backgroundColor: "black",
          color: "white",
          borderRadius: "8px",
          whiteSpace: "nowrap",
        }}
      >
        <TurnLeftIcon style={{ transform: "rotate(180deg)", fontSize:'25px'}}/>
      </Button>
      </Tooltip>
    )}
            </div>
          ))
        )}

        {/* Spinner when waiting on AI, AND not show when chat is empty */}
        {history.length > 0 && loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "20px 0",
            }}
          >
            <CircularProgress />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="input-section">
        <div className="input-text-field" style={{ position: "relative" }}>
          <textarea
            placeholder="Write here"
            className="input-text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            style={{
              right: "10px",
              position: "absolute",
              bottom: "7px",
              backgroundColor: "black",
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
