import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import Tooltip from "@mui/material/Tooltip";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

// 🔹 Reusable CodeBlock component
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "text";
  const codeString = String(children).replace(/\n$/, "");

  // Inline code → small pill, no button
  if (inline) {
    return (
      <code
        className={className}
        style={{
          backgroundColor: "rgba(0,0,0,0.06)",
          padding: "2px 4px",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
        {...props}
      >
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(codeString);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = codeString;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div style={{ margin: "10px 0", borderRadius: "8px", overflow: "hidden" }}>
      {/* Header bar with language + copy button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px",
          fontSize: "0.75rem",
          backgroundColor: "#f5f5f5",
          border: "1px solid #e0e0e0",
          borderBottom: "none",
        }}
      >
        <span style={{ opacity: 0.8 }}>{language}</span>
        <Tooltip title={copied ? "Copied!" : "Copy"}>
          <IconButton size="small" onClick={handleCopy} style={{ padding: 4 }}>
            {copied ? (
              <CheckIcon fontSize="small" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </div>

      {/* Code box */}
      <SyntaxHighlighter
        style={materialOceanic}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          border: "1px solid #e0e0e0",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "12px",
          fontSize: "0.9rem",
        }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
};

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

              {/* RESPONSE HEADER */}
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
                <ReactMarkdown
                  components={{
                    code: CodeBlock,
                  }}
                >
                  {item.response || ""}
                </ReactMarkdown>
              </div>

              {/* Branch button ... (unchanged) */}
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
                        right: "-40px",
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
                      <TurnLeftIcon style={{ transform: "rotate(180deg)", fontSize: "25px" }} />
                    </Button>
                  </Tooltip>
                )}
            </div>
          ))
        )}

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

      {/* INPUT ... (unchanged) */}
      <div className="input-section">
        <div className="input-text-field" style={{ position: "relative" }}>
         <textarea
            placeholder="Write here"
            className="input-text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
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
