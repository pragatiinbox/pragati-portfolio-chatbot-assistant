// pages/index.js
import AssistantModal from "../components/AssistantModal";

export default function Home() {
  // Projects pre-filled with pragatisharma.in links (update later if needed)
  const projects = [
    { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
    { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
    { id: "p3", title: "Brand Refresh", short: "Visual identity & brand guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" },
    { id: "p4", title: "Design System", short: "Reusable components & tokens", url: "https://pragatisharma.in/design-system", type: "system" }
  ];

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Pragati Sharma — Portfolio Assistant Demo</h1>
      <p>Open the assistant using the floating button at bottom-right.</p>

      <AssistantModal projects={projects} />
    </main>
  );
}
