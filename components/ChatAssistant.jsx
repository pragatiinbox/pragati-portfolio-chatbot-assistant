// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/* ---------- CONFIG ---------- */
const BRAND = { blue: "#0f80d9", footerGap: 24 };

/*
  Each suggestion has a safe fallback `answer` so the chip
  always shows something even if faq.json doesn't include it.
*/
const SUGGESTIONS = [
  {
    key: "mobile",
    text: "Show me your best mobile project",
    emoji: "📱",
    answer:
      "My top mobile project is Mobile Checkout Redesign — it simplified the flow and improved conversion. See: https://pragatisharma.in/mobile-checkout"
  },
  {
    key: "research",
    text: "How do you approach research?",
    emoji: "🔬",
    answer:
      "I start with stakeholder interviews, map assumptions, then run 2–3 rapid tests to validate direction. I prioritise quick learning and iterate."
  },
  {
    key: "tools",
    text: "Which tools do you use?",
    emoji: "🧰",
    answer:
      "I use Figma for UI & systems, FigJam for whiteboards, basic prototyping in Figma + Framer for demos, and Notion/Loom for documentation and async walkthroughs."
  },
  {
    key: "about",
    text: "Who is Pragati?",
    emoji: "👋",
    answer:
      "Pragati is a Product & UX Designer (5yrs) focused on simplifying complex flows for B2C & B2B. See portfolio: https://pragatisharma.in"
  }
];
/* ---------------------------- */

/* Inline typing indicator small component */
function TypingIndicator() {
  return (
    <div
      style={{
        display: "inline-flex",
        gap: 6,
        padding: "8px 12px",
        background: "#f1f8ff",
        borderRadius: 12,
      }}
      aria-hidden
    >
      <div style={{ width: 6, height: 6, borderRadius: 999, background: "#9fc7ff", animation: "pulse 1s infinite" }} />
      <div style={{ width: 6, height: 6, borderRadius: 999, background: "#9fc7ff", animation: "pulse 1s .2s infinite" }} />
      <div style={{ width: 6, height: 6, borderRadius: 999, background: "#9fc7ff", animation: "pulse 1s .4s infinite" }} />
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
          100% { opacity: 0.25; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function ChatAssistant() {
  const [faq, setFaq] = useState([]);
  const [messages, setMessages] = useState([]); // { id, role, text }
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const middleRef = useRef(null);

  useEffect(() => {
    // load public/faq.json if present; silent fallback to []
    fetch("/faq.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("no faq")))
      .then((j) => setFaq(j || []))
      .catch(() => setFaq([]));
  }, []);

  useEffect(() => {
    // auto-scroll when messages update
    if (!middleRef.current) return;
    // slight delay to let DOM layout
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 40);
  }, [messages]);

  const addMessage = (m) =>
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ...m }
    ]);

  // Basic FAQ matcher (exact question or any keyword)
  function matchFAQ(text) {
    const t = (text || "").toLowerCase();
    if (!t) return null;
    // exact question match
    for (const e of faq) {
      if ((e.question || "").toLowerCase() === t) return e;
    }
    // keyword match
    for (const e of faq) {
      if (!e.keywords) continue;
      for (const kw of e.keywords) {
        if (t.includes(kw.toLowerCase())) return e;
      }
    }
    return null;
  }

  // Make assistant "type" then add message (simulated latency)
  function assistantReply(text) {
    setIsTyping(true);
    // choose simulated delay based on message length
    const delay = Math.min(1200 + text.length * 8, 2200);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ role: "assistant", text });
      setShowSuggestions(false);
    }, delay);
  }

  // Called for user submit or suggestion click
  function handleQuestion(text) {
    if (!text || !text.trim()) return;
    const t = text.trim();
    addMessage({ role: "user", text: t });
    setInput("");

    // 1) check FAQ
    const match = matchFAQ(t);
    if (match) {
      // prefer match.answer; include source if available
      const answer = match.answer || "Here's what I found.";
      assistantReply(answer + (match.source ? `\n\nSource: ${match.source}` : ""));
      return;
    }

    // 2) check suggestions fallback (safe, local canned answers)
    const s = SUGGESTIONS.find((x) => x.text.toLowerCase() === t.toLowerCase());
    if (s && s.answer) {
      assistantReply(s.answer);
      return;
    }

    // 3) fallback honest message
    assistantReply(
      "I don't have that exact information in my sources. Would you like me to show related projects or common topics?"
    );
  }

  function onSubmit(e) {
    e?.preventDefault();
    handleQuestion(input);
  }

  function onSuggestionClick(s) {
    // Use the suggestion text, but prefer FAQ match first
    handleQuestion(s.text);
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fbfeff"
      }}
    >
      {/* scrollable middle */}
      <div ref={middleRef} style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {/* header (hero, not sticky) — will scroll away like ChatGPT */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)`
            }}
          />
          <div>
            <h2 style={{ color: BRAND.blue, margin: 0, fontSize: 36, fontWeight: 700 }}>
              Hey there! Can I help you with anything?
            </h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        {/* chat messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start"
              }}
            >
              <div
                style={{
                  background: m.role === "user" ? BRAND.blue : "#f7fbff",
                  color: m.role === "user" ? "#fff" : "#061425",
                  padding: "12px 16px",
                  borderRadius: 12,
                  maxWidth: "78%",
                  boxShadow: m.role === "assistant" ? "0 10px 30px rgba(2,6,23,0.03)" : "none"
                }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* typing indicator shows as assistant bubble */}
          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "8px 12px", borderRadius: 12, background: "#f1f8ff" }}>
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* give some bottom padding so content doesn't hide behind footer */}
        <div style={{ height: BRAND.footerGap + 90 }} />
      </div>

      {/* footer - sticky like ChatGPT input (but here as end-of-modal sticky) */}
      <div style={{ padding: BRAND.footerGap, background: "transparent" }}>
        <div
          style={{
            margin: `0 ${BRAND.footerGap}px`,
            background: "#fff",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 20px 60px rgba(2,6,23,0.06)"
          }}
        >
          {showSuggestions && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onSuggestionClick(s)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid #f3f6fa",
                    background: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{s.text}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              placeholder="Ask anything you need"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                height: 48,
                padding: "12px 16px",
                borderRadius: 12,
                border: "1.5px solid rgba(15,128,217,0.12)"
              }}
            />
            <button
              type="submit"
              style={{
                minWidth: 92,
                height: 48,
                borderRadius: 12,
                background: BRAND.blue,
                color: "#fff",
                border: "none"
              }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
