// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Final ChatAssistant component
 * - Feather inline SVG icons
 * - Headings use Pangaia (bold); body uses Poppins
 * - Brand blue: #0f80d9
 * - Suggested chips include emojis + small feather icon when appropriate
 * - Conversation area below input
 */

const BRAND = {
  blue: "#0f80d9",
  bg: "#ffffff",
  pale: "#fbfeff",
  softGray: "#f3f6fa",
  text: "#061425",
  muted: "#6b7280",
  radius: 18,
  shadowSoft: "0 12px 36px rgba(15, 128, 217, 0.06)",
  shadowDeep: "0 30px 80px rgba(2,6,23,0.12)"
};

// Suggested buttons — you can edit text or emoji here
const SUGGESTIONS = [
  { key: "mobile", text: "Show me your best mobile project", emoji: "📱", icon: "smartphone" },
  { key: "research", text: "How do you approach research?", emoji: "🔬", icon: "flask" },
  { key: "tools", text: "Which tools do you use?", emoji: "🧰", icon: "tool" },
  { key: "about", text: "Who is Pragati?", emoji: "👋", icon: "user" }
];

// Small FAQ repository; edit to write your voice
const FAQS = [
  {
    keys: ["what tools", "tools do you use", "which tools"],
    answer:
      "I primarily use Figma for UI, Protopie for interactions, FigJam for workshops, and Notion for documentation. I validate designs with Maze usability tests."
  },
  {
    keys: ["design process", "process", "how do you design"],
    answer:
      "Research → sketch → prototype → validate. I prioritise hypotheses, prototype quickly, and test with real users before iterating."
  },
  {
    keys: ["who is pragati", "who is pragati sharma", "about pragati"],
    answer:
      "Pragati Sharma is a product designer focused on scalable, empathetic design systems. Her case studies highlight impact and outcomes."
  },
  {
    keys: ["experience", "industry", "worked"],
    answer:
      "I've worked across fintech, telecom and SaaS with a focus on measurable outcomes such as conversion uplift, retention, and decreased task time."
  }
];

function findFaq(text) {
  const t = (text || "").toLowerCase();
  for (const f of FAQS) {
    for (const k of f.keys) {
      if (t.includes(k)) return f.answer;
    }
  }
  return null;
}

/* Feather inline icons */
function IconMic({ stroke = BRAND.blue, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1v11" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 11a7 7 0 01-14 0" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 21v-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend({ stroke = "#fff", size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22l-3-9-9-3 19-7z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.06" />
    </svg>
  );
}
function IconSmartphone({ stroke = BRAND.blue, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="2" width="10" height="20" rx="2" stroke={stroke} strokeWidth="1.6" />
      <path d="M11 18h2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IconFlask({ stroke = BRAND.blue, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 2h8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 7h8l-4 7v5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTool({ stroke = BRAND.blue, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 2l6 6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 14l8 8" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21l6-6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUser({ stroke = BRAND.blue, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconClose({ stroke = "#374151", size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M18 6L6 18" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l12 12" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* helper: map icon key to component */
function SuggestionIcon({ name }) {
  if (name === "smartphone") return <IconSmartphone />;
  if (name === "flask") return <IconFlask />;
  if (name === "tool") return <IconTool />;
  if (name === "user") return <IconUser />;
  return null;
}

export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there! Can I help you with anything?" },
    { role: "assistant-sub", text: "Ready to assist you with anything you need." }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const containerRef = useRef(null);

  // speech recognition (Chrome)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + t : t));
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  // scroll on message change
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }

  function addMessage(m) {
    setMessages(prev => [...prev, m]);
  }

  function handleSuggestion(s) {
    // add user message
    addMessage({ role: "user", text: s.text });
    // check FAQ quick match
    const faq = findFaq(s.text);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      return;
    }
    // canned outputs by key
    if (s.key === "mobile") {
      const txt = `My top mobile project: Mobile Checkout Redesign — Checkout flow & microinteractions. View: https://pragatisharma.in/mobile-checkout`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "research") {
      const txt = "I start with stakeholder interviews, map assumptions, and run 2–3 rapid tests to validate direction.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "tools") {
      const txt = "Figma, Protopie, FigJam, Notion, Maze — chosen per stage and fidelity.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "about") {
      const txt = "Pragati Sharma is a product designer creating thoughtful, scalable product experiences. Check her case studies on the site.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    // fallback
    const fallback = "Thanks — I got that. Ask me to open a case study or request a short summary.";
    addMessage({ role: "assistant", text: fallback });
    speak(fallback);
  }

  function toggleMic() {
    if (!recRef.current) {
      alert("Speech recognition not supported in this browser (try Chrome).");
      return;
    }
    if (listening) {
      recRef.current.stop();
      setListening(false);
    } else {
      recRef.current.start();
      setListening(true);
    }
  }

  function onSubmit(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    addMessage({ role: "user", text: input });

    const faq = findFaq(input);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      setInput("");
      return;
    }

    const lower = input.toLowerCase();
    if (lower.includes("mobile") && lower.includes("project")) {
      const txt = `My mobile case study: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      setInput("");
      return;
    }

    const fallback = `I heard: "${input}". I can open a case study, give a short summary, or share hiring highlights.`;
    addMessage({ role: "assistant", text: fallback });
    speak(fallback);
    setInput("");
  }

  /* styles (JS-in-CSS for simplicity) */
  const styles = {
    root: {
      minHeight: "100%",
      background: BRAND.pale,
      display: "flex",
      flexDirection: "column",
      fontFamily: "var(--font-body)"
    },
    hero: {
      padding: "40px 48px",
      textAlign: "center",
      background: `linear-gradient(180deg, rgba(15,128,217,0.04), rgba(15,128,217,0.01))`
    },
    orb: {
      width: 92,
      height: 92,
      borderRadius: 20,
      display: "grid",
      placeItems: "center",
      margin: "0 auto 18px",
      background: `linear-gradient(135deg, rgba(15,128,217,0.08), rgba(15,128,217,0.02))`,
      boxShadow: "0 12px 36px rgba(15,128,217,0.06)"
    },
    title: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: 44,
      lineHeight: 1.02,
      color: BRAND.blue,
      fontWeight: 700
    },
    subtitle: { marginTop: 8, color: BRAND.muted, fontSize: 16 },
    inputArea: { padding: "32px 56px", display: "flex", flexDirection: "column", gap: 18 },
    formRow: { display: "flex", gap: 12, alignItems: "center" },
    input: {
      flex: 1,
      padding: "18px 20px",
      borderRadius: 14,
      border: `1px solid ${BRAND.softGray}`,
      fontSize: 16,
      background: "#fff",
      boxShadow: "0 8px 30px rgba(10,20,40,0.04)",
      outline: "none"
    },
    micBtn: {
      display: "grid", placeItems: "center",
      borderRadius: 12, border: `1px solid ${BRAND.softGray}`, padding: 10,
      background: "#fff", cursor: "pointer", boxShadow: "0 6px 18px rgba(10,20,40,0.04)"
    },
    sendBtn: {
      display: "flex", gap: 8, alignItems: "center",
      background: BRAND.blue, color: "#fff", border: "none",
      padding: "12px 18px", borderRadius: 12, cursor: "pointer",
      boxShadow: "0 10px 30px rgba(15,128,217,0.18)"
    },
    suggestionsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 },
    suggestionBtn: {
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`,
      background: "#fff", cursor: "pointer", fontSize: 14, color: BRAND.text,
      boxShadow: "0 8px 24px rgba(10,20,40,0.04)"
    },
    conversation: {
      marginTop: 12, padding: 12, borderRadius: 14, background: "#fff",
      minHeight: 220, boxShadow: "inset 0 1px 0 rgba(10,20,40,0.02)", overflow: "auto"
    },
    bubbleUser: {
      maxWidth: "78%", padding: "12px 14px", borderRadius: 12, background: BRAND.blue, color: "#fff"
    },
    bubbleAssistant: {
      maxWidth: "78%", padding: "12px 14px", borderRadius: 12, background: "#f7fbff", color: BRAND.text
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.hero}>
        <div style={styles.orb}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: `linear-gradient(145deg, ${BRAND.blue}, #a6d9ff)` }} />
        </div>

        <h1 style={styles.title}>Hey there!<br />Can I help you with anything?</h1>
        <p style={styles.subtitle}>Ready to assist you with anything you need.</p>
      </div>

      <div style={styles.inputArea}>
        <form onSubmit={onSubmit} style={styles.formRow}>
          <input
            aria-label="Ask anything you need"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything you need"
            style={styles.input}
          />

          <button type="button" onClick={toggleMic} aria-label="Speak" style={styles.micBtn}>
            <IconMic />
          </button>

          <button type="submit" aria-label="Send" style={styles.sendBtn}>
            <span style={{ fontWeight: 600 }}>Send</span>
            <IconSend />
          </button>
        </form>

        <div style={styles.suggestionsRow}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => handleSuggestion(s)} style={styles.suggestionBtn}>
              <span style={{ fontSize: 16 }}>{s.emoji}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <SuggestionIcon name={s.icon} />
                <span>{s.text}</span>
              </span>
            </button>
          ))}
        </div>

        <div ref={containerRef} style={styles.conversation}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
