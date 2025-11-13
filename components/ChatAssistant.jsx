// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Styled ChatAssistant to visually match Pragati's portfolio look & feel.
 * - Overwrites THEME at top to match portfolio colors, radii, shadows.
 * - Background uses a subtle dotted-grid pattern to echo the portfolio.
 * - Edit FAQS for your exact canned answers.
 */

const THEME = {
  // visual palette tuned to match the screenshot you provided
  headlineBlue: "#2b6de6",   // main bright blue (headings)
  softBlue: "#e9f3ff",       // pale tile blue
  softYellow: "#fff6d8",     // pale butter tile
  warmAccent: "#f6b93b",     // warm accent (buttons/CTA)
  cardBg: "#fbfdff",         // card surface
  text: "#0b1220",
  muted: "#6b7280",
  radius: 18,
  shadowSoft: "0 10px 30px rgba(15, 23, 42, 0.06)",
  shadowDeep: "0 30px 80px rgba(2,6,23,0.12)"
};

// small FAQ repository — edit these to sound like you
const FAQS = [
  {
    keys: ["what tools", "tools do you use", "what tools do you use"],
    answer:
      "I design in Figma for UI and flows, use Protopie for interactions, and run usability sessions with Maze. I keep docs in Notion."
  },
  {
    keys: ["design process", "process", "how do you design"],
    answer:
      "Research → Sketch → Prototype → Validate. I prioritise hypotheses, prototype fast, and test with real users before iterating."
  },
  {
    keys: ["hiring", "hire", "recruiter"],
    answer:
      "For hiring, I highlight impact: metrics, outcomes, and ownership. Ask me to show 2–3 projects perfect for recruitment conversations."
  },
  {
    keys: ["contact", "reach you", "email"],
    answer:
      "You can email Pragati at hi@pragatisharma.in — or ask me to open a specific case study and I'll link it."
  }
];

function findFaqReply(text) {
  const t = (text || "").toLowerCase();
  for (const f of FAQS) {
    for (const k of f.keys) {
      if (t.includes(k)) return f.answer;
    }
  }
  return null;
}

export default function ChatAssistant({ projects = [], onClose = () => {} }) {
  // initial greeting matches portfolio voice — now asks role immediately
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hello — welcome! Who are you visiting as today?" }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [stage, setStage] = useState("askRole");
  const containerRef = useRef(null);

  // speech recognition (Chrome)
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

  // speak using browser TTS
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    // slightly slower for friendly tone
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }

  function addMessage(msg) {
    setMessages(m => [...m, msg]);
  }

  // projects fallback to placeholders if none passed
  function suggestForRole(role) {
    const list = projects.length ? projects : [
      { id: "p1", title: "Mobile Checkout Redesign", short: "Checkout flow & microinteractions", url: "https://pragatisharma.in/mobile-checkout", type: "mobile" },
      { id: "p2", title: "B2B Dashboard", short: "Data-heavy dashboard & analytics", url: "https://pragatisharma.in/b2b-dashboard", type: "web" },
      { id: "p3", title: "Brand Refresh", short: "Visual identity & brand guidelines", url: "https://pragatisharma.in/brand-refresh", type: "brand" }
    ];

    if (role === "recruiter") return list.filter(p => p.type !== "brand").slice(0, 3);
    if (role === "designer") return list.filter(p => p.type === "system" || p.type === "brand").slice(0, 3);
    return list.slice(0, 3);
  }

  function chooseRole(role) {
    addMessage({ role: "user", text: role });
    const greeting = `Great — you're visiting as a ${role}. Here are a few projects you might like:`;
    addMessage({ role: "assistant", text: greeting });
    const recs = suggestForRole(role);
    recs.forEach(r => addMessage({ role: "assistant", text: `• ${r.title} — ${r.short} (${r.url})` }));
    speak(greeting);
    setStage("chat");
  }

  function toggleMic() {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported by this browser.");
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

    // check FAQ repository first
    const faq = findFaqReply(input);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      setInput("");
      return;
    }

    // keyword-based helpful replies
    const lower = input.toLowerCase();
    if (lower.includes("mobile") && lower.includes("best")) {
      const recs = suggestForRole("designer");
      const txt = `My top mobile project is ${recs[0].title} — ${recs[0].short} (${recs[0].url})`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      setInput("");
      return;
    }

    const fallback = `I heard: "${input}". I can open a case study, give a short summary, or share hiring-friendly highlights. Try: "Show me your best mobile project" or "How do you approach research?"`;
    addMessage({ role: "assistant", text: fallback });
    speak(fallback);
    setInput("");
    setStage("chat");
  }

  const quickPrompts = [
    { text: "Show me your best mobile project", bg: THEME.softBlue, handler: () => {
      addMessage({ role: "user", text: "Show me your best mobile project" });
      const recs = suggestForRole("designer");
      const canned = `${recs[0].title} — ${recs[0].short} (${recs[0].url})`;
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }},
    { text: "How do you approach research?", bg: THEME.softYellow, handler: () => {
      addMessage({ role: "user", text: "How do you approach research?" });
      const canned = "I start with stakeholder interviews, map assumptions, and run 2–3 rapid usability tests within two weeks to validate direction.";
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }},
    { text: "What tools do you use?", bg: THEME.softBlue, handler: () => {
      addMessage({ role: "user", text: "What tools do you use?" });
      const canned = "Figma, Protopie, FigJam, Maze and Notion — each used depending on stage and fidelity needed.";
      addMessage({ role: "assistant", text: canned });
      speak(canned);
    }}
  ];

  // styles tuned to match portfolio (dotted bg, rounded tiles, soft shadow)
  const styles = {
    pageBg: {
      // dotted subtle grid similar to your portfolio
      backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
      backgroundColor: "#ffffff"
    },
    wrapper: {
      padding: 18,
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: THEME.cardBg,
      fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
    },
    messages: { overflowY: "auto", padding: 10, flex: 1 },
    assistantBubble: {
      background: "linear-gradient(180deg,#fbfdff,#f7fbff)",
      color: THEME.text,
      padding: "12px 16px",
      borderRadius: THEME.radius,
      boxShadow: THEME.shadowSoft,
      maxWidth: "78%",
      fontSize: 15
    },
    userBubble: {
      background: THEME.headlineBlue,
      color: "#fff",
      padding: "12px 16px",
      borderRadius: THEME.radius,
      maxWidth: "78%",
      fontSize: 15
    },
    quickRow: { display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" },
    quickBtn: (bg) => ({
      background: bg,
      padding: "8px 12px",
      borderRadius: 12,
      border: "none",
      cursor: "pointer",
      boxShadow: THEME.shadowSoft,
      fontSize: 13
    }),
    bottomBar: { marginTop: 10 }
  };

  return (
    <div style={{ ...styles.pageBg }}>
      <div style={styles.wrapper}>
        <div ref={containerRef} style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", margin: "10px 0" }}>
              <div style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
                {m.text}
              </div>
              {m.role === "assistant" && m.text && (
                <button onClick={() => speak(m.text)} style={{ marginLeft: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 18 }}>🔊</button>
              )}
            </div>
          ))}
        </div>

        <div style={styles.bottomBar}>
          <div style={styles.quickRow}>
            {quickPrompts.map((p, idx) => (
              <button key={idx} onClick={p.handler} style={styles.quickBtn(p.bg || THEME.softBlue)}>
                {p.text}
              </button>
            ))}
          </div>

          {stage === "askRole" && (
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <button onClick={() => chooseRole("recruiter")} style={{ padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: THEME.softBlue }}>I'm a recruiter</button>
              <button onClick={() => chooseRole("designer")} style={{ padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: THEME.softYellow }}>I'm a designer</button>
              <button onClick={() => chooseRole("curious")} style={{ padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", background: "#fff", border: `1px solid ${THEME.softBlue}` }}>Just curious</button>
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={toggleMic} style={{ padding: "10px", borderRadius: 12, border: "none", background: THEME.headlineBlue, color: "#fff", cursor: "pointer" }}>
              {listening ? "Stop 🎙️" : "Speak 🎙️"}
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or type your message..."
              style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid #e6eefc`, fontSize: 15 }}
            />

            <button type="submit" style={{ padding: "10px 14px", borderRadius: 12, background: THEME.warmAccent, border: "none", cursor: "pointer", color: "#0b1220" }}>
              Send
            </button>
          </form>

          <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>
            Tip: try "Show me your best mobile project" or pick a role above.
          </div>
        </div>
      </div>
    </div>
  );
}
