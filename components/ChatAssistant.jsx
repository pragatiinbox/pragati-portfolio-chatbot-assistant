// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";
import TypingMessage from "../embed/components/TypingMessage"; // ensure path exists

/* ---------- CONFIG ---------- */
const BRAND = { blue: "#0f80d9", footerGap: 24 };
const SUGGESTIONS = [
  { key: "mobile", text: "Show me your best mobile project", emoji: "📱" },
  { key: "research", text: "How do you approach research?", emoji: "🔬" },
  { key: "tools", text: "Which tools do you use?", emoji: "🧰" },
  { key: "about", text: "Who is Pragati?", emoji: "👋" }
];
/* ---------------------------- */

export default function ChatAssistant() {
  // core state
  const [faq, setFaq] = useState([]);
  const [messages, setMessages] = useState([]); // { id, role: "user"|"assistant", loading?, tempText?, text }
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const middleRef = useRef(null);
  const footerRef = useRef(null);

  // load FAQ (if you have /faq.json in public)
  useEffect(() => {
    fetch("/faq.json")
      .then((r) => r.ok ? r.json() : Promise.reject("no faq"))
      .then((j) => setFaq(j || []))
      .catch(() => setFaq([]));
  }, []);

  // auto-scroll to bottom on messages change
  useEffect(() => {
    if (!middleRef.current) return;
    // small timeout so newly rendered content/typing can measure
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 30);
  }, [messages]);

  // helper: add a raw message object
  const addMessage = (m) => setMessages((prev) => [...prev, m]);

  // FAQ matcher (exact question -> keywords)
  function handleFAQ(userText) {
    const t = (userText || "").toLowerCase().trim();
    if (!t) return null;
    // exact question match
    for (const entry of faq) {
      if ((entry.question || "").toLowerCase().trim() === t) return entry;
    }
    // keywords match
    for (const entry of faq) {
      if (!entry.keywords) continue;
      for (const kw of entry.keywords) {
        if (t.includes(kw.toLowerCase())) return entry;
      }
    }
    return null;
  }

  // Core: send assistant reply with typing animation
  function sendAssistantReply(finalText, { instantForShort = true } = {}) {
    const id = `assistant-${Date.now()}`;
    // initial placeholder message (loading true will render TypingMessage)
    addMessage({ id, role: "assistant", loading: true, tempText: finalText, text: "" });
    // TypingMessage onComplete will flip loading -> false and move to final text.
    // No extra timers required here; see render loop for onComplete handler.
  }

  // Submit handler: check FAQ first then fallback
  function onSubmit(e) {
    e?.preventDefault();
    const text = (input || "").trim();
    if (!text) return;
    // add user message instantly
    addMessage({ id: `user-${Date.now()}`, role: "user", text });
    setInput("");
    setShowSuggestions(false);

    // FAQ hit?
    const hit = handleFAQ(text);
    if (hit) {
      // respond using curated answer (no hallucination)
      // show typing if answer length > 60 (feel), else show instantly via sendAssistantReply + instant short bypass
      if ((hit.answer || "").length > 60) {
        sendAssistantReply(hit.answer);
      } else {
        addMessage({ id: `assistant-${Date.now()}`, role: "assistant", loading: false, text: hit.answer });
      }
      if (hit.source) {
        // optionally show source as a separate assistant message (instant)
        addMessage({ id: `assistant-src-${Date.now()}`, role: "assistant", loading: false, text: `Source: ${hit.source}` });
      }
      return;
    }

    // no FAQ match -> polite transparent fallback (use typing animation)
    const fallback = "I don't have that exact info in my sources. Would you like me to show related projects, common topics, or let me try to search for more details?";
    sendAssistantReply(fallback);
  }

  // when a suggestion chip is clicked
  function handleSuggestion(s) {
    // behave like a user typed it
    addMessage({ id: `user-${Date.now()}`, role: "user", text: s.text });
    setShowSuggestions(false);

    const hit = handleFAQ(s.text);
    if (hit) {
      if ((hit.answer || "").length > 60) sendAssistantReply(hit.answer);
      else addMessage({ id: `assistant-${Date.now()}`, role: "assistant", loading: false, text: hit.answer });
      if (hit.source) addMessage({ id: `assistant-src-${Date.now()}`, role: "assistant", loading: false, text: `Source: ${hit.source}` });
      return;
    }
    // fallback short reply
    sendAssistantReply("I don't have that exact information in my sources. Want to see related projects instead?");
  }

  // utility: convert messages for rendering
  // (render mapping below includes TypingMessage usage)
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fbfeff", borderRadius: 12 }}>
      {/* Scrollable middle */}
      <div ref={middleRef} style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {/* Header / hero — this is part of conversation and will scroll away */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 12,
            background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)`,
            boxShadow: "0 10px 30px rgba(15,34,64,0.06)"
          }} />
          <div>
            <h2 style={{ color: BRAND.blue, margin: 0, fontSize: 32, fontFamily: "'PPPangaia', Georgia, serif" }}>
              Hey there! Can I help you with anything?
            </h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        {/* Conversation messages area */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m) => {
            const isUser = m.role === "user";
            const alignStyle = { display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" };
            const bubbleStyle = {
              background: isUser ? BRAND.blue : "#f7fbff",
              color: isUser ? "#fff" : "#061425",
              padding: "12px 16px",
              borderRadius: 12,
              maxWidth: "78%",
              boxShadow: isUser ? "0 8px 20px rgba(15,128,217,0.18)" : "none"
            };

            // assistant loading state -> render TypingMessage with onComplete that flips the message
            if (m.role === "assistant" && m.loading) {
              return (
                <div key={m.id} style={alignStyle}>
                  <div style={{ maxWidth: "78%" }}>
                    <TypingMessage
                      text={m.tempText || ""}
                      charsPerSecond={100}
                      onComplete={() => {
                        // flip message to final text
                        setMessages((prev) => prev.map(pm => {
                          if (pm.id === m.id) return { ...pm, loading: false, text: pm.tempText };
                          return pm;
                        }));
                      }}
                      instant={(m.tempText || "").length < 80}
                    />
                  </div>
                </div>
              );
            }

            // plain message (user or assistant final)
            return (
              <div key={m.id} style={alignStyle}>
                <div style={bubbleStyle}>
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Padded sticky footer box — not position:fixed (keeps it inside modal) */}
      <div style={{ padding: BRAND.footerGap }}>
        <div
          ref={footerRef}
          style={{
            margin: `0 ${BRAND.footerGap}px`,
            background: "#fff",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 20px 60px rgba(2,6,23,0.06)"
          }}
        >
          {/* Suggestions */}
          {showSuggestions && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid #f3f6fa",
                    background: "#fff",
                    whiteSpace: "nowrap",
                    cursor: "pointer"
                  }}
                >
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>
                  {s.text}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
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
                border: "1.5px solid rgba(15,128,217,0.12)",
                outline: "none",
                fontSize: 15
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
                border: "none",
                cursor: "pointer",
                fontWeight: 700
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
