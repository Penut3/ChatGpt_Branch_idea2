import React, { useState, useEffect, useRef } from "react";
import { Button } from "@mui/material";
import ReactMarkdown from "react-markdown";
import CircularProgress from "@mui/material/CircularProgress";
import TurnLeftIcon from "@mui/icons-material/TurnLeft";
import Tooltip from "@mui/material/Tooltip";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AltRouteIcon from "@mui/icons-material/AltRoute";
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
          backgroundColor: "black",
         
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
        // style={materialOceanic}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          backgroundColor: "black",
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

export default function ChatWindow({ history, onSend, loading, onBranchFromMessage, onOpenGridFromChat, }) {
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
    <div className="ai-section" style={{ marginLeft: 300, width: "100%" }}>

      <div style={{position:"fixed", left:"390px", top:"20px"}}>
        <Button style={{ textTransform: "none",
            minWidth: "28px",
            width: "28px",
            height: "28px",
            color: "white",
            borderRadius: "8px",
            whiteSpace: "nowrap",}}
            onClick={onOpenGridFromChat}>
              
            <GridViewIcon style={{color: "#3b3b3b"}} />
            <p style={{paddingLeft:"5px"}}>Grid</p>
          </Button>
      </div>
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
                    backgroundColor: "var(--b-light-grey)",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow:"0 0 2px #181818"
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

                    hr: ({ node }) => (
                      <div
                        style={{
                          borderTop: "1px solid #555",
                          margin: "24px 0",
                          opacity: 0.6,
                        }}
                      />
                    ),
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
                       
                        textTransform: "none",
                        minWidth: "36px",
                        width: "36px",
                        height: "36px",
                        backgroundColor: "black",
                        color: "white",
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        border:"none"
                      }}
                    >
                       <AltRouteIcon style={{ transform: "rotate(90deg)", fontSize: "25px" }} />
                    
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
        <div className="input-text-field">
          <textarea
            placeholder="Write here"
            className="input-text"
             rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
            <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end", // ⬅ button goes to bottom
      alignSelf: "stretch",       // ⬅ wrapper matches parent height
    }}
  >
          <Button
            variant="contained"
            onClick={handleSubmit}
            style={{
              display:"flex",
              justifyContent:"center",
            
              
              backgroundColor: "white",
              borderRadius:"30px",
              padding:"5px",
              marginBottom:"0px",
              minWidth:"40px",
              minHeight: "40px"
             
            }}
          >
           <ArrowUpwardIcon sx={{ fontSize: 25, color: "black", fill:"black" }} />

          </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
