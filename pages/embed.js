// pages/embed.js
import ChatAssistant from "../components/ChatAssistant";

export default function Embed() {
  // Bring your real project links here (same shape as other pages)
  const projects = [
    { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
    { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
    { id: "p3", title: "Brand Refresh", short: "Visual identity & brand guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" },
    { id: "p4", title: "Design System", short: "Reusable components & tokens", url: "https://pragatisharma.in/design-system", type: "system" }
  ];

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(2,6,23,0.45)",
      zIndex: 9999,
      padding: 20
    }}>
      <div style={{
        width: 820,
        maxWidth: "100%",
        height: "82vh",
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(2,6,23,0.3)",
        display: "flex",
        flexDirection: "column"
      }}>
        <div style={{ padding: 14, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 16 }}>Pragati's Assistant</strong>
          <button onClick={() => window.close?.()} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ flex: 1 }}>
          <ChatAssistant projects={projects} />
        </div>
      </div>
    </div>
  );
}
