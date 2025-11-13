// pages/embed.js
import ChatAssistant from "../components/ChatAssistant";

export default function Embed() {
  const projects = [
    { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
    { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
    { id: "p3", title: "Brand Refresh", short: "Visual identity & brand guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" }
  ];

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
          position: relative; /* important */
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
          .assistant-header { padding: 12px; }
        }

        .assistant-header {
          padding: 18px;
          display:flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(10,20,40,0.03);
        }

        /* IMPORTANT: assistant-body will be the relative container for chat + absolute footer */
        .assistant-body { flex: 1; display: flex; flex-direction: column; position: relative; }
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
          <ChatAssistant projects={projects} />
        </div>
      </div>
    </div>
  );
}
