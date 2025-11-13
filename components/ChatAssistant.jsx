// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * ChatAssistant
 * - Edit THEME below to tweak colors, radius, font sizes.
 * - Edit FAQS array to add your own question => answer pairs.
 * - This component no longer mentions "demo" anywhere.
 */

const THEME = {
  primary: "#0f172a",        // dark brand color (change this)
  accent: "#7c3aed",         // accent color for buttons
  bg: "#ffffff",             // card background
  surface: "#f8fafc",        // assistant message background
  userBg: "#111827",         // user message background
  userColor: "#ffffff",
  radius: 14,
  shadow: "0 20px 50px rgba(2,6,23,0.12)"
};

// A small FAQ repository you can expand.
// If visitor question matches a key phrase, assistant returns your answer.
// Keep the question short and keys lowercase for matching.
const FAQS = [
  {
    keys: ["what tools", "tools do you use", "what tools do you use"],
    answer: "I design with Figma / FigJam for UI and flows, use Protopie for micro-interactions and run usability sessions with Maze. I use Notion to document decisions."
  },
  {
    keys: ["design process", "process", "how do you design"],
    answer: "My process: research -> sketch -> prototype -> validate. I keep stakeholders involved with weekly design checkpoints and rapid prototypes."
  },
  {
    keys: ["hire", "hiring", "recruiter"],
    answer: "For hiring: I highlight impact (metrics), ownership, and measurable outcomes. Ask me to summarise 2–3 projects best for hiring."
  },
  {
    keys: ["contact", "reach you", "email"],
    answer: "You can email me at hi@pragatisharma.in — or ask the assistant to open a project's case study for details."
  }
];

function findFaqReply(text) {
  const t = text.toLowerCase();
  for (const f of FAQS) {
    for (const k of f.keys) {
      if (t.includes(k)) return f.answer;
    }
  }
  return null;
}

export default function ChatAssistant({ projects = [], onClose = () => {} }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi — welcome! I’m Pragati’s assistant. Who are you visiting as?" }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [stage, setStage] = useState("askRole"); // start by asking role
  const [visitorRole, setVisitorRole] = useState(null);
  const containerRef = useRef(null);

  // Setup speech recognition (Chrome)
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

  // autoscroll
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
    const instantReply = `Thanks — visiting as a ${role}. Here are projects I recommend for you:`;
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

    // first check FAQ repository
    const faq = findFaqReply(input);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      setInput("");
      return;
    }

    // next, simple keyword handling
    const lower = input.toLowerCase();
    if (lower.includes("best mobile") || lower.includes("mobile project")) {
      const recs = suggestForRole("designer");
      const txt = `My top mobile project: ${recs[0].title} — ${recs[0].short} (${recs[0].url})`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      setInput("");
      return;
    }

    // fallback canned reply (friendly & personal tone)
    const reply = `I heard: "${input}". I can open a project, share process notes, or give hiring-friendly summaries. Try: "Show me your best mobile project" or "How do you approach research?"`;
    addMessage({ role: "assistant", text: reply });
    speak(reply);
    setInput("");
    setStage("chat");
  }

  // quick prompts can change easily here
  const quickPrompts = [
    { text: "Show me your best mobile project", handler: () => {
      addMessage({ role: "user", text: "Show me your best mobile project" });
      const recs = suggestForRole("designer");
      const canned = `${recs[0].title} — ${recs[0].short} (${recs[0].url})`;
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }},
    { text: "How do you approach research?", handler: () => {
      addMessage({ role: "user", text: "How do you approach research?" });
      const canned = "I start with stakeholder interviews, map assumptions, and run 2–3 rapid usability tests within 1–2 weeks to validate direction.";
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }},
    { text: "What tools do you use?", handler: () => {
      addMessage({ role: "user", text: "What tools do you use?" });
      const canned = "I use Figma for UI, Protopie for interactions, Notion for docs, and FigJam for early workshops.";
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }}
  ];

  // UI helper styles using THEME
  const styles = {
    container: { padding: 14, display: "flex", flexDirection: "column", height: "100%", background: THEME.bg, fontFamily: "Inter, system-ui, sans-serif" },
    messages: { overflowY: "auto", padding: 10, flex: 1 },
    bubbleAssistant: { background: THEME.surface, color: "#0b1220", padding: "10px 14px", borderRadius: THEME.radius, maxWidth: "78%" },
    bubbleUser: { background: THEME.userBg, color: THEME.userColor, padding: "10px 14px", borderRadius: THEME.radius, maxWidth: "78%" },
    bottomBar: { marginTop: 10 }
  };

  return (
    <div style={styles.container}>
      <div ref={containerRef} style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "8px 0" }}>
            <div style={m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}>
              {m.text}
            </div>
            {m.role === "assistant" && m.text && (
              <button onClick={() => speak(m.text)} style={{ marginLeft: 8, border: "none", background: "transparent", cursor: "pointer" }}>🔊</button>
            )}
          </div>
        ))}
      </div>

      <div style={styles.bottomBar}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          {quickPrompts.map((p, idx) => (
            <button key={idx} onClick={p.handler} style={{ padding: "6px 10px", borderRadius: 10, border: `1px solid ${THEME.surface}`, background: "#fff", cursor: "pointer" }}>
              {p.text}
            </button>
          ))}
        </div>

        {stage === "askRole" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={() => chooseRole("recruiter")} style={{ padding: "8px 10px", borderRadius: 8 }}>I'm a recruiter</button>
            <button onClick={() => chooseRole("designer")} style={{ padding: "8px 10px", borderRadius: 8 }}>I'm a designer</button>
            <button onClick={() => chooseRole("curious")} style={{ padding: "8px 10px", borderRadius: 8 }}>Just curious</button>
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={toggleMic} style={{ padding: "8px 10px", borderRadius: 8 }}>
            {listening ? "Stop 🎙️" : "Speak 🎙️"}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or type your message..."
            style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${THEME.surface}` }}
          />

          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: THEME.accent, color: "#fff", border: "none" }}>Send</button>
        </form>

        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Tip: use the quick prompts or tell me who you are.
        </div>
      </div>
    </div>
  );
}
