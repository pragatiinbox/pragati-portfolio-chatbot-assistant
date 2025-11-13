// components/ChatAssistant.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * ChatAssistant — footer end-to-end and pinned
 * - Footer visually spans the modal horizontally (margin 24px each side)
 * - Footer pinned to modal bottom (sibling of the scroll area)
 * - Middle scroll area reserves footer height + 24px so content scrolls underneath
 */

const BRAND = {
  blue: "#0f80d9",
  muted: "#6b7280",
  softGray: "#f3f6fa",
  footerGap: 24 // breathing space (px)
};

const SUGGESTIONS = [
  { key: "mobile", text: "Show me your best mobile project", emoji: "📱" },
  { key: "research", text: "How do you approach research?", emoji: "🔬" },
  { key: "tools", text: "Which tools do you use?", emoji: "🧰" },
  { key: "about", text: "Who is Pragati?", emoji: "👋" }
];

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

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const middleRef = useRef(null);
  const footerRef = useRef(null);
  const recRef = useRef(null);

  // optional speech recognition
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
    r.onend = () => {};
    recRef.current = r;
  }, []);

  // measure footer and reserve space in middle scroll area
  const measureAndReserve = () => {
    if (!middleRef.current || !footerRef.current) return;
    const footerHeight = footerRef.current.offsetHeight || 0;
    const gap = BRAND.footerGap;
    middleRef.current.style.paddingBottom = `${footerHeight + gap}px`;
  };

  useLayoutEffect(() => {
    measureAndReserve();
    const ro = new ResizeObserver(() => measureAndReserve());
    if (footerRef.current) ro.observe(footerRef.current);
    window.addEventListener("resize", measureAndReserve);
    return () => {
      window.removeEventListener("resize", measureAndReserve);
      try { ro.disconnect(); } catch (e) {}
    };
  }, []);

  // scroll on new messages
  useEffect(() => {
    if (!middleRef.current) return;
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 30);
  }, [messages]);

  function addMessage(m) { setMessages(prev => [...prev, m]); }

  function handleSuggestion(s) {
    setShowSuggestions(false);
    addMessage({ role: "user", text: s.text });
    // demo assistant replies
    if (s.key === "mobile") {
      addMessage({ role: "assistant", text: `My top mobile project: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout` });
      return;
    }
    if (s.key === "research") {
      addMessage({ role: "assistant", text: "I start with stakeholder interviews, map assumptions, and run 2–3 rapid tests to validate direction." });
      return;
    }
    if (s.key === "tools") {
      addMessage({ role: "assistant", text: "Figma, Protopie, FigJam, Notion, Maze — chosen per stage." });
      return;
    }
    addMessage({ role: "assistant", text: "Pragati is a Product Designer creating thoughtful, scalable product experiences." });
  }

  function toggleMic() {
    if (!recRef.current) return alert("Speech recognition not supported in this browser.");
    try { recRef.current.start(); } catch (e) {}
  }

  function onSubmit(e) {
    e?.preventDefault();
    if (!input.trim()) return;
    addMessage({ role: "user", text: input });
    addMessage({ role: "assistant", text: `I heard: "${input}". I can open a case study or provide details.` });
    setInput("");
    setShowSuggestions(false);
  }

  const groups = groupMessages(messages);

  // styles (inline for easy copy/paste)
  const styles = {
    shell: { height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box", background: "#fbfeff", fontFamily: "var(--font-body)" },

    middle: {
      flex: 1,
      overflowY: "auto",
      padding: 28,
      boxSizing: "border-box",
      WebkitOverflowScrolling: "touch"
    },

    hero: { display: "flex", gap: 16, alignItems: "center", marginBottom: 18 },
    heroBlob: { width: 72, height: 72, borderRadius: 14, background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)`, boxShadow: "0 18px 40px rgba(15,128,217,0.06)" },
    heroTitle: { fontFamily: "var(--font-heading)", color: BRAND.blue, fontSize: 36, lineHeight: 1.02, margin: 0 },
    heroSubtitle: { marginTop: 8, color: BRAND.muted, fontSize: 15 },

    messagesWrap: { display: "flex", flexDirection: "column", gap: 18 },

    leftBubble: { alignSelf: "flex-start", background: "#f7fbff", color: "#061425", padding: "12px 16px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 14px 30px rgba(10,20,40,0.04)", boxSizing: "border-box" },
    rightBubble: { alignSelf: "flex-end", background: BRAND.blue, color: "#fff", padding: "12px 16px", borderRadius: 12, maxWidth: "78%", boxShadow: "0 12px 30px rgba(15,128,217,0.14)", boxSizing: "border-box" },

    // make footer appear end-to-end inside modal (24px left/right margin)
    footerShell: { boxSizing: "border-box", background: "transparent", paddingTop: 0, paddingBottom: BRAND.footerGap },

    footerBox: {
      margin: `0 ${BRAND.footerGap}px`,   // this makes it span from modal left-inner to right-inner with 24px margins
      width: `calc(100% - ${BRAND.footerGap * 2}px)`,
      background: "#fff",
      borderRadius: 14,
      boxShadow: "0 20px 60px rgba(2,6,23,0.06)",
      padding: 16,
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
    <div style={styles.shell}>
      {/* MIDDLE (scrollable) */}
      <div ref={middleRef} style={styles.middle} aria-live="polite">
        <div style={styles.hero}>
          <div style={styles.heroBlob} />
          <div>
            <h2 style={styles.heroTitle}>Hey there! Can I help you with anything?</h2>
            <div style={styles.heroSubtitle}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        <div style={styles.messagesWrap}>
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
      </div>

      {/* FOOTER pinned to bottom; full-width inside modal using left/right margin */}
      <div style={styles.footerShell}>
        <div ref={footerRef} style={styles.footerBox}>
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
  );
}
