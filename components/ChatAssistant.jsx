// components/ChatAssistant.jsx
// Copy-paste this entire file and overwrite your existing ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

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
  const [faq, setFaq] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const middleRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // load FAQ once from public/faq.json (deployed with site)
    fetch("/faq.json")
      .then(res => res.json())
      .then(j => setFaq(j || []))
      .catch(() => setFaq([]));
  }, []);

  useEffect(() => {
    // auto-scroll when messages update
    if (!middleRef.current) return;
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 30);
  }, [messages]);

  const addMessage = (m) => setMessages(prev => [...prev, m]);

  // ---------- simple FAQ matcher (zero-cost)
  // lowercases the user input and checks if any keyword is included
  function handleFAQ(userText) {
    const t = (userText || "").toLowerCase();
    if (!t) return null;
    // Priority: exact phrase match on question, then keywords
    for (const entry of faq) {
      if ((entry.question || "").toLowerCase() === t) return entry;
    }
    for (const entry of faq) {
      if (!entry.keywords) continue;
      for (const kw of entry.keywords) {
        if (t.includes(kw.toLowerCase())) return entry;
      }
    }
    return null;
  }

  // ---------- submit handler (tries FAQ first)
  function onSubmit(e) {
    e?.preventDefault();
    const text = (input || "").trim();
    if (!text) return;

    // show user message immediately
    addMessage({ role: "user", text });
    setInput("");

    // try FAQ
    const hit = handleFAQ(text);
    if (hit) {
      // respond with curated answer (no hallucination)
      addMessage({ role: "assistant", text: hit.answer });
      if (hit.source) {
        addMessage({ role: "assistant", text: `Source: ${hit.source}` });
      }
      setShowSuggestions(false);
      return;
    }

    // fallback: no FAQ match — be honest, ask the user to rephrase or request more info
    addMessage({ role: "assistant", text: "I don't have that exact information in my sources. Would you like me to show related projects or common topics?" });
    setShowSuggestions(false);
  }

  // suggestion click -> acts like a user question
  function handleSuggestion(s) {
    setInput("");
    addMessage({ role: "user", text: s.text });
    const hit = handleFAQ(s.text);
    if (hit) {
      addMessage({ role: "assistant", text: hit.answer });
      if (hit.source) addMessage({ role: "assistant", text: `Source: ${hit.source}` });
    } else {
      addMessage({ role: "assistant", text: "I don't have that exact information in my sources." });
    }
    setShowSuggestions(false);
  }

  // ---------------- UI (simple)
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fbfeff" }}>
      <div ref={middleRef} style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)` }} />
          <div>
            <h2 style={{ color: BRAND.blue, margin: 0, fontSize: 32 }}>Hey there! Can I help you with anything?</h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                background: m.role === "user" ? BRAND.blue : "#f7fbff",
                color: m.role === "user" ? "#fff" : "#061425",
                padding: "12px 16px",
                borderRadius: 12,
                maxWidth: "78%"
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: BRAND.footerGap }}>
        <div style={{
          margin: `0 ${BRAND.footerGap}px`,
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 20px 60px rgba(2,6,23,0.06)"
        }}>
          {showSuggestions && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.key} onClick={() => handleSuggestion(s)} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #f3f6fa", background: "#fff" }}>
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>{s.text}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              placeholder="Ask anything you need"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, height: 48, padding: "12px 16px", borderRadius: 12, border: "1.5px solid rgba(15,128,217,0.12)" }}
            />
            <button type="submit" style={{ minWidth: 92, height: 48, borderRadius: 12, background: BRAND.blue, color: "#fff", border: "none" }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
