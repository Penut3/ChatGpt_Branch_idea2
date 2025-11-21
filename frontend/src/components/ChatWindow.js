import React, { useState } from "react";
import { Button } from "@mui/material";
import ReactMarkdown from "react-markdown";

export default function ChatWindow({ history, onSend, loading }) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    onSend(input);
    setInput("");
  };

  return (
    <div className="ai-section" style={{ marginLeft: 230, width: "100%" }}>
      <div className="output-section">
        {loading ? (
          <p>Loading chat...</p>
        ) : history.length === 0 ? (
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
