// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * ChatAssistant – corrected behavior
 * - Assumes modal header exists (pages/embed.js) with fixed height
 * - Chat scroll area fills assistant-body height, and footer is absolute inside assistant-body
 * - No position: fixed used; footer cannot leak outside modal
 */

const BRAND = {
  blue: "#0f80d9",
  pale: "#fbfeff",
  softGray: "#f3f6fa",
  text: "#061425",
  muted: "#6b7280",
  radius: 18,
  footerHeightPx: 110
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
  { keys: ["who is pragati", "who is pragati sharma"], answer: "Pragati Sharma is a product designer building thoughtful, scalable product experiences. See case studies on the site." }
];

function findFaq(text) {
  const t = (text || "").toLowerCase();
  for (const f of FAQS) {
    for (const k of f.keys) if (t.includes(k)) return f.answer;
  }
  return null;
}

function IconMic({ stroke = BRAND.blue, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="2" width="10" height="14" rx="6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18v3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21h8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend({ stroke = "#fff", size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22l-3-9-9-3 19-7z" stroke={stroke} strokeWidth="1.0" strokeLinecap="round" strokeLinejoin="round" opacity="0.06" />
    </svg>
  );
}

function groupMessages(msgs) {
  if (!msgs || msgs.length === 0) return [];
  const groups = [];
  let current = { role: msgs[0].role, texts: [msgs[0].text] };
  for (let i = 1; i < msgs.length; i++) {
    const m = msgs[i];
    if (m.role === current.role) current.texts.push(m.text);
    else {
      groups.push(current);
      current = { role: m.role, texts: [m.text] };
    }
  }
  groups.push(current);
  return groups;
}

export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there! Can I help you with anything?" },
    { role: "assistant", text: "Ready to assist you with anything you need." }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
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

  useEffect(() => {
    if (!scrollRef.current) return;
    setTimeout(() => {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 40);
  }, [messages]);

  function addMessage(msg) { setMessages(prev => [...prev, msg]); }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }

  function handleSuggestion(s) {
    setShowSuggestions(false);
    addMessage({ role: "user", text: s.text });
    const faq = findFaq(s.text);
    if (faq) { addMessage({ role: "assistant", text: faq }); speak(faq); return; }
    if (s.key === "mobile") { const txt = `My top mobile project: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if (s.key === "research") { const txt = "I start with stakeholder interviews, map assumptions, and run 2–3 rapid tests to validate direction."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if (s.key === "tools") { const txt = "Figma, Protopie, FigJam, Notion, Maze — chosen per stage and fidelity."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if (s.key === "about") { const txt = "Pragati Sharma is a product designer creating thoughtful, scalable product experiences."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    addMessage({ role: "assistant", text: "Thanks — I got that. Ask me to open a case study or request more details." }); speak("Thanks — I got that.");
  }

  function toggleMic() {
    if (!recRef.current) { alert("Speech recognition not supported in this browser (try Chrome)."); return; }
    if (listening) { recRef.current.stop(); setListening(false); } else { recRef.current.start(); setListening(true); }
  }

  function onSubmit(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    setShowSuggestions(false);
    addMessage({ role: "user", text: input });
    const faq = findFaq(input);
    if (faq) { addMessage({ role: "assistant", text: faq }); speak(faq); setInput(""); return; }
    const lower = input.toLowerCase();
    if (lower.includes("mobile") && lower.includes("project")) {
      const txt = `My mobile case study: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`;
      addMessage({ role: "assistant", text: txt }); speak(txt); setInput(""); return;
    }
    addMessage({ role: "assistant", text: `I heard: "${input}". I can open a case study, give a summary, or provide hiring highlights.` }); speak(input); setInput("");
  }

  const groups = groupMessages(messages);

  /* styles */
  const styles = {
    container: { height: "100%", display: "flex", flexDirection: "column", background: BRAND.pale, fontFamily: "var(--font-body)" },

    // scroll area must fill the entire assistant-body (whose height is calc in embed.js)
    scrollArea: {
      height: "100%",
      overflowY: "auto",
      padding: 32,
      paddingBottom: BRAND.footerHeightPx + 32 // reserve for footer
    },

    messagesWrap: { display: "flex", flexDirection: "column", gap: 12 },

    groupLeft: { alignSelf: "flex-start", background: "#f7fbff", color: BRAND.text, padding: "10px 14px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 6px 18px rgba(10,20,40,0.03)" },
    groupRight: { alignSelf: "flex-end", background: BRAND.blue, color: "#fff", padding: "10px 14px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 8px 24px rgba(15,128,217,0.12)" },

    // footer absolute INSIDE modal body
    footerOuter: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      padding: "16px 0 26px"
    },
    footerBox: { width: "92%", maxWidth: 1180, background: "#fff", borderRadius: 14, boxShadow: "0 -20px 60px rgba(2,6,23,0.06)", padding: "14px 20px" },
    suggestionsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 },
    suggestionBtn: { padding: "10px 14px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", fontSize: 14 },
    inputRow: { display: "flex", gap: 12, alignItems: "center" },
    input: { flex: 1, padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${BRAND.blue}`, fontSize: 15 },
    micBtn: { padding: 12, borderRadius: 12, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" },
    sendBtn: { padding: "12px 18px", borderRadius: 14, background: BRAND.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }
  };

  return (
    <div style={styles.container}>
      {/* scroll area now fills the assistant-body height */}
      <div ref={scrollRef} style={styles.scrollArea} aria-live="polite">
        {/* NOTE: the "hero" large heading is intentionally not rendered here;
            the modal header (pages/embed.js) contains the visible brand header.
            We keep here just the messages. */}
        <div style={{ height: 6 }} />

        <div style={styles.messagesWrap}>
          {groups.map((g, gi) => {
            const isUser = g.role === "user";
            return (
              <div key={gi} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div style={isUser ? styles.groupRight : styles.groupLeft}>
                  {g.texts.map((t, ti) => (
                    <div key={ti} style={{ marginBottom: ti < g.texts.length - 1 ? 8 : 0 }}>{t}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer absolute INSIDE modal body */}
      <div style={styles.footerOuter} aria-hidden={false}>
        <div style={styles.footerBox}>
          {showSuggestions && (
            <div style={styles.suggestionsRow}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => handleSuggestion(s)} style={styles.suggestionBtn}>
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} style={styles.inputRow}>
            <input aria-label="Ask anything you need" placeholder="Ask anything you need" value={input} onChange={(e) => setInput(e.target.value)} style={styles.input} />
            <button type="button" onClick={toggleMic} title="Speak" style={styles.micBtn} aria-label="Speak">
              <IconMic />
            </button>
            <button type="submit" style={styles.sendBtn} aria-label="Send">
              <span style={{ fontWeight: 700 }}>Send</span>
              <IconSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
