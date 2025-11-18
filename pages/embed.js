// pages/embed.js
import { useEffect, useMemo, useState } from "react";
import ChatAssistant from "../components/ChatAssistant";

export default function Embed() {
  const [mode, setMode] = useState({ hideHeader: false, full: false });

  useEffect(() => {
    // read query params client-side only
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hideHeader = params.get("hideHeader") === "1" || params.get("hideHeader") === "true";
      const full = params.get("full") === "1" || params.get("full") === "true";
      setMode({ hideHeader, full });
    }
  }, []);

  // Send message to parent (Framer) to close the overlay
  function postClose() {
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage({ type: "close-assistant" }, "*");
    }
  }

  // If you want to pass projects as props to ChatAssistant, compute them here.
  const projects = useMemo(() => ([
    // keep this in sync with your API if used
    { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
    { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
    { id: "p3", title: "Brand Refresh", short: "Visual identity & guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" }
  ]), []);

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      alignItems: mode.full ? "stretch" : "center",
      justifyContent: "center",
      background: "transparent",
      padding: 20,
      boxSizing: "border-box"
    }}>
      <style>{`
        :root {
          --assistant-header-h: 64px;
        }

        .assistant-shell {
          width: ${mode.full ? "100%" : "70vw"};
          height: ${mode.full ? "100%" : "75vh"};
          max-width: ${mode.full ? "100%" : "1180px"};
          max-height: ${mode.full ? "100%" : "900px"};
          border-radius: ${mode.full ? "0" : "18px"};
          overflow: hidden;
          background: #fbfeff;
          box-shadow: ${mode.full ? "none" : "0 40px 120px rgba(2,6,23,0.12)"};
          display: flex;
          flex-direction: column;
          position: relative;
        }

        @media (max-width: 1024px) {
          .assistant-shell { width: ${mode.full ? "100%" : "88vw"}; height: ${mode.full ? "100%" : "82vh"}; }
        }

        @media (max-width: 640px) {
          .assistant-shell {
            width: 96vw;
            height: 96vh;
            border-radius: 12px;
            max-width: 100%;
            max-height: 100%;
          }
        }

        .assistant-header {
          height: var(--assistant-header-h);
          min-height: var(--assistant-header-h);
          padding: 12px 20px;
          display:flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(10,20,40,0.03);
          background: transparent;
        }

        .assistant-body {
          height: calc(100% - var(--assistant-header-h));
          display: block;
          position: relative;
        }

        /* If hideHeader is active, hide the header visually but keep accessibility (aria-hidden) */
        .assistant-header.hidden { display: none; height: 0; min-height: 0; }
      `}</style>

      <div className="assistant-shell" role="dialog" aria-modal="true">
        <div className={`assistant-header ${mode.hideHeader ? "hidden" : ""}`}>
          <div style={{ fontFamily: "var(--font-heading, system-ui)", fontSize: 18, fontWeight: 700, color: "#0f80d9" }}>
            { !mode.hideHeader ? "Pragati's Assistant" : "" }
          </div>
          <div>
            <button onClick={postClose} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer" }} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M18 6L6 18" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 6l12 12" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="assistant-body" style={{ height: mode.hideHeader ? "100%" : undefined }}>
          <ChatAssistant projects={projects} />
        </div>
      </div>
    </div>
  );
}
