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
      <div style={{
        width: "92%",
        maxWidth: 1180,
        height: "86vh",
        borderRadius: 18,
        overflow: "hidden",
        background: "#fbfeff",
        boxShadow: "0 40px 120px rgba(2,6,23,0.12)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(10,20,40,0.03)" }}>
          <div style={{ fontFamily: "'Pangaia', 'Poppins', sans-serif", fontSize: 18, fontWeight: 600, color: "#0f80d9" }}>Pragati's Assistant</div>
          <div>
            <button onClick={postClose} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer" }} aria-label="Close">✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto" }}>
          <ChatAssistant projects={projects} />
        </div>
      </div>
    </div>
  );
}
