// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - projects: optional array of { id, title, short, url, type } to use as suggestions
 */
export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi — how are you today? 👋" }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [stage, setStage] = useState("greeting"); // greeting -> askRole -> chat
  const [visitorRole, setVisitorRole] = useState(null); // 'recruiter' | 'designer' | 'curious'
  const containerRef = useRef(null);

  // Setup browser speech recognition if available
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  // autoscroll to bottom when messages change
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }

  function addMessage(msg) {
    setMessages(m => [...m, msg]);
  }

  // Simple canned suggestion logic (client-side)
  function suggestForRole(role) {
    const list = projects.length ? projects : [
      { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
      { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
      { id: "p3", title: "Brand Refresh", short: "Visual identity & brand guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" },
      { id: "p4", title: "Design System", short: "Reusable components & tokens", url: "https://pragatisharma.in/design-system", type: "system" }
    ];

    if (role === "recruiter") return list.filter(p => p.type !== "brand").slice(0, 3);
    if (role === "designer") return list.filter(p => p.type === "system" || p.type === "brand").slice(0, 3);
    return list.slice(0, 3);
  }

  function chooseRole(role) {
    setVisitorRole(role);
    addMessage({ role: "user", text: role });
    const instantReply = `Thanks — because you're visiting as a ${role}, here are a few projects I recommend:`;
    addMessage({ role: "assistant", text: instantReply });
    const recs = suggestForRole(role);
    recs.forEach(r => addMessage({ role: "assistant", text: `• ${r.title} — ${r.short} (${r.url})` }));
    speak(instantReply);
    setStage("chat");
  }

  function toggleMic() {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    addMessage({ role: "user", text: input });

    // canned reply: short helpful guidance
    const reply = `Thanks — I heard: "${input}". Try asking about a specific project (e.g., "Tell me about Mobile Checkout") or click a role button to see tailored projects.`;
    addMessage({ role: "assistant", text: reply });
    speak(reply);

    setInput("");
    setStage("chat");
  }

  const quickPrompts = [
    "Show me your best mobile project",
    "Explain your design process",
    "What tools do you use?",
    "Summarize top projects for hiring"
  ];

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={containerRef} style={{ overflowY: "auto", padding: 8, flex: 1 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "8px 0" }}>
            <div style={{
              background: m.role === "user" ? "#111827" : "#f3f4f6",
              color: m.role === "user" ? "white" : "black",
              padding: "10px 14px",
              borderRadius: 12,
              maxWidth: "78%"
            }}>
              {m.text}
            </div>
            {m.role === "assistant" && m.text && (
              <button onClick={() => speak(m.text)} style={{ marginLeft: 8 }}>🔊</button>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {quickPrompts.map((p, idx) => (
            <button key={idx} onClick={() => {
              addMessage({ role: "user", text: p });
              const canned = `Sure — ${p}. (This is a demo reply from Pragati's assistant.)`;
              addMessage({ role: "assistant", text: canned });
              speak(canned);
            }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #eee", cursor: "pointer" }}>
              {p}
            </button>
          ))}
        </div>

        {stage === "askRole" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => chooseRole("recruiter")}>I'm a recruiter</button>
            <button onClick={() => chooseRole("designer")}>I'm a designer</button>
            <button onClick={() => chooseRole("curious")}>Just curious</button>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={toggleMic} style={{ padding: "8px 10px" }}>
            {listening ? "Stop 🎙️" : "Speak 🎙️"}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or type your message..."
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #ddd" }}
          />

          <button type="submit" style={{ padding: "8px 12px" }}>Send</button>
        </form>

        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
          Tip: click a suggestion to start — or say “I’m a recruiter”.
        </div>
      </div>
    </div>
  );
}
