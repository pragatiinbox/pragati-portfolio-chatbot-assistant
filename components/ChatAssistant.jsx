// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * ChatAssistant — stable layout:
 * - Top hero: fixed height (no duplication)
 * - Middle messages area: flex:1 and scrollable (only this scrolls)
 * - Footer: position: sticky inside scroll context with bottom padding (sticky + padded)
 *
 * Replace the existing file with this exact code.
 */

const BRAND = {
  blue: "#0f80d9",
  pale: "#fbfeff",
  softGray: "#f3f6fa",
  text: "#061425",
  muted: "#6b7280",
  radius: 18,
  footerPadding: 18 // used for sticky bottom offset
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

function IconMic({ stroke = BRAND.blue, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="2" width="10" height="14" rx="6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 18v3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 21h8" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend({ stroke = "#fff", size = 16 }) {
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
  // start with no messages so the hero only shows once (hero contains greeting)
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const middleRef = useRef(null); // scrollable middle region (only this scrolls)
  const recRef = useRef(null);

  // speech recognition init (if supported)
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

  // auto-scroll middle area to bottom when messages change
  useEffect(() => {
    if (!middleRef.current) return;
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
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

  // layout sizes
  const HERO_HEIGHT = 160; // px — fixed top hero height
  const styles = {
    root: { height: "100%", display: "flex", flexDirection: "column", background: BRAND.pale, fontFamily: "var(--font-body)", boxSizing: "border-box" },

    // HERO: fixed height, does not scroll
    hero: {
      height: HERO_HEIGHT,
      minHeight: HERO_HEIGHT,
      padding: "28px 32px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    },
    heroTitle: { fontFamily: "var(--font-heading)", color: BRAND.blue, fontSize: 34, margin: 0, lineHeight: 1.02 },
    heroSubtitle: { marginTop: 8, color: BRAND.muted, fontSize: 15 },

    // MIDDLE: this is the only scrollable area (flex:1)
    middle: {
      flex: 1,
      overflowY: "auto",
      padding: 32,
      boxSizing: "border-box",
      position: "relative",
      // ensure there is some bottom padding so sticky footer has breathing room
      paddingBottom: `${BRAND.footerPadding + 160}px`
    },

    messagesWrap: { display: "flex", flexDirection: "column", gap: 18 },

    leftBubble: { alignSelf: "flex-start", background: "#f7fbff", color: BRAND.text, padding: "12px 16px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 14px 30px rgba(10,20,40,0.04)", boxSizing: "border-box" },
    rightBubble: { alignSelf: "flex-end", background: BRAND.blue, color: "#fff", padding: "12px 16px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 12px 30px rgba(15,128,217,0.14)", boxSizing: "border-box" },

    // FOOTER: sticky inside the middle area, with bottom padding offset
    footerStickyWrap: {
      position: "sticky",
      bottom: BRAND.footerPadding, // padded sticky so it's visually separated from modal bottom
      left: 0,
      right: 0,
      zIndex: 30,
      display: "flex",
      justifyContent: "center",
      paddingTop: 12,
      boxSizing: "border-box"
    },

    footerBox: {
      width: "92%",
      maxWidth: 1180,
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 -20px 60px rgba(2,6,23,0.06)",
      padding: "14px 20px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 12
    },

    suggestionsRow: { display: "flex", gap: 12, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4 },
    suggestionBtn: { padding: "10px 14px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", fontSize: 14, whiteSpace: "nowrap", boxSizing: "border-box" },

    inputRow: { display: "flex", gap: 12, alignItems: "center", boxSizing: "border-box" },

    input: {
      flex: 1,
      height: 48,
      padding: "12px 16px",
      borderRadius: 12,
      border: `1.5px solid rgba(15,128,217,0.12)`,
      fontSize: 15,
      boxSizing: "border-box",
      outline: "none",
      background: "#fff",
      transition: "box-shadow 160ms ease"
    },

    micBtn: {
      width: 48,
      height: 48,
      minWidth: 48,
      borderRadius: 12,
      border: `1px solid ${BRAND.softGray}`,
      background: "#fff",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      boxSizing: "border-box"
    },

    sendBtn: {
      minWidth: 92,
      height: 48,
      borderRadius: 12,
      background: BRAND.blue,
      color: "#fff",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 16px",
      boxSizing: "border-box",
      boxShadow: "0 10px 30px rgba(15,128,217,0.16)"
    },

    focusShadow: { boxShadow: `0 0 0 6px rgba(15,128,217,0.06), 0 6px 20px rgba(15,128,217,0.08)` }
  };

  return (
    <div style={styles.root}>
      {/* HERO - fixed and unique (no duplication) */}
      <div style={styles.hero}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)`, boxShadow: "0 12px 36px rgba(15,128,217,0.06)" }} />
          <div>
            <h2 style={styles.heroTitle}>Hey there! Can I help you with anything?</h2>
            <div style={styles.heroSubtitle}>Ready to assist you with anything you need.</div>
          </div>
        </div>
      </div>

      {/* MIDDLE area: only this scrolls (messages + sticky footer inside it) */}
      <div ref={middleRef} style={styles.middle} aria-live="polite">
        {/* message list */}
        <div style={styles.messagesWrap}>
          {groups.length === 0 && (
            // small visual spacing when there are no chat messages
            <div style={{ height: 8 }} />
          )}

          {groups.map((g, gi) => {
            const isUser = g.role === "user";
            return (
              <div key={gi} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div style={isUser ? styles.rightBubble : styles.leftBubble}>
                  {g.texts.map((t, ti) => <div key={ti} style={{ marginBottom: ti < g.texts.length - 1 ? 8 : 0 }}>{t}</div>)}
                </div>
              </div>
            );
          })}
        </div>

        {/* STICKY FOOTER (inside middle scroll area) — padded with bottom offset */}
        <div style={styles.footerStickyWrap}>
          <div style={styles.footerBox}>
            {showSuggestions && (
              <div style={styles.suggestionsRow} role="list">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => handleSuggestion(s)} style={styles.suggestionBtn} role="listitem">
                    <span style={{ marginRight: 8 }}>{s.emoji}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={onSubmit} style={styles.inputRow}>
              <input
                aria-label="Ask anything you need"
                placeholder="Ask anything you need"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={styles.input}
                onFocus={(e) => (e.currentTarget.style.boxShadow = styles.focusShadow.boxShadow)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />

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
    </div>
  );
}
