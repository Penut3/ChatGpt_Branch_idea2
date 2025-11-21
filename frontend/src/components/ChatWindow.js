import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";


export default function ChatWindow({ history, onSend, loading }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  

  const handleSubmit = () => {
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
      <div key={index} style={{ marginBottom: "20px" }}>
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
        <div style={{ fontWeight: "bold", marginTop: "10px" }}>
          Response:
        </div>
        <ReactMarkdown>{item.response}</ReactMarkdown>
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
