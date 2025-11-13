// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * ChatAssistant (sticky footer input + suggestions)
 * - Header is inside the scroll area so it scrolls away (like ChatGPT)
 * - Footer is sticky at bottom: suggestions above input, input + mic + send below
 * - Suggestions auto-hide after first user interaction (can be changed)
 * - Inline Feather-like icons (rounded, slightly thicker strokes)
 *
 * Replace the file entirely with this code and commit.
 */

const BRAND = {
  blue: "#0f80d9",
  pale: "#fbfeff",
  softGray: "#f3f6fa",
  text: "#061425",
  muted: "#6b7280",
  radius: 18
};

const SUGGESTIONS = [
  { key: "mobile", text: "Show me your best mobile project", emoji: "📱" },
  { key: "research", text: "How do you approach research?", emoji: "🔬" },
  { key: "tools", text: "Which tools do you use?", emoji: "🧰" },
  { key: "about", text: "Who is Pragati?", emoji: "👋" }
];

const FAQS = [
  { keys: ["what tools", "tools do you use", "which tools"], answer: "I primarily use Figma for UI, Protopie for interactions, FigJam for workshops, and Notion for documentation. I validate designs with Maze." },
  { keys: ["design process", "process", "how do you design"], answer: "Research → sketch → prototype → validate. I prioritise hypotheses and test quickly with prototypes." },
  { keys: ["who is pragati", "who is pragati sharma"], answer: "Pragati Sharma is a product designer building scalable, empathetic product experiences. See case studies on the site." },
  { keys: ["experience", "industry", "worked"], answer: "I've worked across fintech, telecom and SaaS with a focus on measurable outcomes." }
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

/* Rounded, slightly thicker feather-like icons to match screenshot */
function IconMic({ stroke = BRAND.blue, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="2" width="12" height="14" rx="6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18v3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21h8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend({ stroke = "#fff", size = 20 }) {
  // filled blue background expected around this icon; icon stroke white
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22l-3-9-9-3 19-7z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.06" />
    </svg>
  );
}

/* If you want to use a custom SVG icon file, see the bottom of this message for instructions */

export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there! Can I help you with anything?" },
    { role: "assistant-sub", text: "Ready to assist you with anything you need." }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const recRef = useRef(null);
  const scrollAreaRef = useRef(null);

  // speech recognition (browser)
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

  // autoscroll on messages
  useEffect(() => {
    // scroll to bottom of the scroll area
    if (!scrollAreaRef.current) return;
    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
  }, [messages]);

  function addMessage(m) {
    setMessages(prev => [...prev, m]);
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }

  function handleSuggestion(s) {
    // hide suggestions after interaction
    setSuggestionsVisible(false);

    addMessage({ role: "user", text: s.text });
    const faq = findFaq(s.text);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      return;
    }
    // canned responses
    if (s.key === "mobile") {
      const txt = `My top mobile project: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`;
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
      const txt = "Pragati Sharma is a product designer creating thoughtful, scalable product experiences.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    const fallback = "Thanks — I got that. Ask me to open a case study or request more details.";
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

    // first interaction hides suggestions
    setSuggestionsVisible(false);

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

    const fallback = `I heard: "${input}". I can open a case study, give a short summary, or provide hiring highlights.`;
    addMessage({ role: "assistant", text: fallback });
    speak(fallback);
    setInput("");
  }

  /* inline styles (JS-in-CSS) */
  const styles = {
    shell: { display: "flex", flexDirection: "column", height: "100%", background: BRAND.pale, fontFamily: "var(--font-body)" },
    scrollArea: { flex: 1, overflow: "auto", padding: 28 },
    headerWrap: { textAlign: "center", padding: "28px 0 20px 0" },
    orb: { width: 86, height: 86, borderRadius: 18, margin: "0 auto 18px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, rgba(15,128,217,0.08), rgba(15,128,217,0.02))`, boxShadow: "0 12px 36px rgba(15,128,217,0.06)" },
    title: { margin: 0, fontFamily: "var(--font-heading)", color: BRAND.blue, fontSize: 36, lineHeight: 1.02, fontWeight: 700 },
    subtitle: { marginTop: 8, color: BRAND.muted, fontSize: 15 },
    messages: { marginTop: 18, display: "flex", flexDirection: "column", gap: 12 },
    messageUser: { alignSelf: "flex-end", background: BRAND.blue, color: "#fff", padding: "10px 14px", borderRadius: 12, maxWidth: "78%" },
    messageAssistant: { alignSelf: "flex-start", background: "#f7fbff", color: BRAND.text, padding: "10px 14px", borderRadius: 12, maxWidth: "78%" },

    /* sticky footer */
    footer: {
      borderTop: "1px solid rgba(10,20,40,0.04)",
      background: "#fff",
      padding: "12px 20px",
      boxShadow: "0 -10px 30px rgba(2,6,23,0.04)",
      position: "sticky",
      bottom: 0,
      zIndex: 40,
      borderRadius: "14px 14px 0 0"
    },
    suggestionsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 },
    suggestionBtn: { padding: "10px 14px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", fontSize: 14, boxShadow: "0 6px 18px rgba(10,20,40,0.04)" },
    inputRow: { display: "flex", gap: 12, alignItems: "center" },
    input: { flex: 1, padding: "14px 18px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, fontSize: 15, background: "#fff" },
    micBtn: { padding: 12, borderRadius: 12, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" },
    sendBtn: { padding: "12px 18px", borderRadius: 14, background: BRAND.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 30px rgba(15,128,217,0.16)" }
  };

  return (
    <div style={styles.shell}>
      {/* scrollable area: header + messages — header scrolls away naturally */}
      <div ref={scrollAreaRef} style={styles.scrollArea}>
        <div style={styles.headerWrap}>
          <div style={styles.orb}><div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(145deg, ${BRAND.blue}, #a6d9ff)` }} /></div>
          <h1 style={styles.title}>Hey there! Can I help you with anything?</h1>
          <div style={styles.subtitle}>Ready to assist you with anything you need.</div>
        </div>

        <div style={styles.messages}>
          {messages.map((m, i) => (
            <div key={i} style={m.role === "user" ? styles.messageUser : styles.messageAssistant}>
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* sticky footer (suggestions above input) */}
      <div style={styles.footer}>
        {/* suggestions (can hide after first interaction) */}
        {suggestionsVisible && (
          <div style={styles.suggestionsRow}>
            {SUGGESTIONS.map((s, idx) => (
              <button key={idx} onClick={() => handleSuggestion(s)} style={styles.suggestionBtn}>
                <span style={{ marginRight: 8 }}>{s.emoji}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* input row */}
        <form onSubmit={onSubmit} style={styles.inputRow}>
          <input aria-label="Ask anything" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything you need" style={styles.input} />
          <button type="button" onClick={toggleMic} title="Speak" style={styles.micBtn} aria-label="Speak">
            <IconMic />
          </button>
          <button type="submit" title="Send" style={styles.sendBtn} aria-label="Send">
            <span style={{ fontWeight: 700 }}>Send</span>
            <IconSend />
          </button>
        </form>
      </div>
    </div>
  );
}
