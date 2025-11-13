// pages/embed.js
import ChatAssistant from "../components/ChatAssistant";

export default function Embed() {
  function postClose() {
    if (typeof window !== "undefined" && window.parent) {
      window.parent.postMessage({ type: "close-assistant" }, "*");
    }
  }

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent"
    }}>
      <style>{`
        :root {
          --assistant-header-h: 64px; /* top small bar height (keeps modal controls) */
        }

        .assistant-shell {
          width: 70vw;
          height: 75vh;
          max-width: 1180px;
          max-height: 900px;
          border-radius: 18px;
          overflow: hidden;
          background: #fbfeff;
          box-shadow: 0 40px 120px rgba(2,6,23,0.12);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        @media (max-width: 1024px) {
          .assistant-shell { width: 88vw; height: 82vh; }
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
      `}</style>

      <div className="assistant-shell" role="dialog" aria-modal="true">
        <div className="assistant-header">
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 18, fontWeight: 700, color: "#0f80d9" }}>
            Pragati's Assistant
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

        <div className="assistant-body">
          <ChatAssistant />
        </div>
      </div>
    </div>
  );
}
