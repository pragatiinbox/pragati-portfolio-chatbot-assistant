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

  // Note: style tag below defines responsive modal size:
  // - Desktop/tablet: width: 70vw, height: 70vh (centered)
  // - Very wide screens: capped by max-width / max-height
  // - Mobile (max-width: 640px): full screen (95vw x 95vh) and stacked layout
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
          height: 70vh;
          max-width: 1180px;
          max-height: 900px;
          border-radius: 18px;
          overflow: hidden;
          background: #fbfeff;
          box-shadow: 0 40px 120px rgba(2,6,23,0.12);
          display: flex;
          flex-direction: column;
        }

        /* Slightly smaller (60vw) on medium screens if you'd prefer 60% */
        @media (min-width: 1200px) and (max-width: 1600px) {
          .assistant-shell { width: 65vw; height: 70vh; }
        }

        /* Mobile: make it almost full-screen, stacked */
        @media (max-width: 640px) {
          .assistant-shell {
            width: 95vw;
            height: 95vh;
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

        .assistant-body { flex: 1; overflow: auto; }
      `}</style>

      <div className="assistant-shell" role="dialog" aria-modal="true">
        <div className="assistant-header">
          <div style={{ fontFamily: "'Pangaia','Poppins',sans-serif", fontSize: 18, fontWeight: 600, color: "#0f80d9" }}>
            Pragati's Assistant
          </div>
          <div>
            <button onClick={postClose} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer" }} aria-label="Close">✕</button>
          </div>
        </div>

        <div className="assistant-body">
          <ChatAssistant projects={projects} />
        </div>
      </div>
    </div>
  );
}
