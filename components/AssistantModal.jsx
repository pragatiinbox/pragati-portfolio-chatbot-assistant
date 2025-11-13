// components/AssistantModal.jsx
import { useState } from "react";
import ChatAssistant from "./ChatAssistant";

export default function AssistantModal({ projects }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        style={{
          position: "fixed",
          right: 20,
          bottom: 28,
          background: "#111827",
          color: "white",
          border: "none",
          padding: "12px 16px",
          borderRadius: 999,
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          cursor: "pointer",
          zIndex: 9999
        }}
      >
        Ask Pragati
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            right: 20,
            bottom: 80,
            width: 360,
            maxWidth: "calc(100% - 40px)",
            height: 520,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(2,6,23,0.2)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Hi — I'm Pragati's Assistant</strong>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            <ChatAssistant projects={projects} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
