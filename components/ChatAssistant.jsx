// components/ChatAssistant.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---------------- CONFIG ---------------- */
const BRAND = { blue: "#0f80d9", footerGap: 24 };

/* Interview-grade suggestion chips (the six we agreed) */
const SUGGESTIONS = [
  { key: "experience", text: "Tell me about your experience", emoji: "🧭" },
  { key: "impact", text: "Your most impactful project", emoji: "🌟" },
  { key: "who", text: "Who is Pragati?", emoji: "👋" },
  { key: "approach", text: "How do you solve problems?", emoji: "🧩" },
  { key: "values", text: "What matters to you in design?", emoji: "🎯" },
  { key: "current", text: "What are you working on now?", emoji: "🔍" }
];
/* ----------------------------------------- */

export default function ChatAssistant() {
  // core state
  const [faq, setFaq] = useState([]); // loaded from public/faq.json
  const [messages, setMessages] = useState([]); // { id, role, text, source? }
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false); // global typing indicator
  const middleRef = useRef(null);

  // -- load faq.json on mount --
  useEffect(() => {
    fetch("/faq.json")
      .then((r) => r.ok ? r.json() : Promise.reject("no faq"))
      .then((j) => setFaq(j || []))
      .catch(() => setFaq([]));
  }, []);

  // -- auto-scroll whenever messages change --
  useEffect(() => {
    if (!middleRef.current) return;
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 40);
  }, [messages]);

  // ---------- UTIL: find an answer in faq ----------
  // Returns { answer, source } or null
  function findAnswer(userText) {
    const t = (userText || "").trim().toLowerCase();
    if (!t || !faq || faq.length === 0) return null;

    // Search each topic -> qa[]
    for (const topic of faq) {
      if (!topic.qa) continue;
      for (const qa of topic.qa) {
        // exact question match (case-insensitive)
        if ((qa.q || "").trim().toLowerCase() === t) {
          return { answer: qa.a, source: qa.source || null };
        }
      }
    }

    // Keyword search: check topic.keywords and qa.q presence or keyword in text
    // First check keywords per topic
    for (const topic of faq) {
      const keys = (topic.keywords || []).map(k => k.toLowerCase());
      for (const kw of keys) {
        if (t.includes(kw)) {
          // prefer first qa[0] from that topic as an overview answer
          const qa0 = (topic.qa && topic.qa[0]);
          if (qa0) return { answer: qa0.a, source: qa0.source || null };
        }
      }
    }

    // Check keywords inside each qa entry
    for (const topic of faq) {
      if (!topic.qa) continue;
      for (const qa of topic.qa) {
        const keywords = (qa.keywords || []).map(k => k.toLowerCase());
        for (const kw of keywords) {
          if (t.includes(kw)) return { answer: qa.a, source: qa.source || null };
        }
      }
    }

    return null;
  }

  // ---------- add message helper ----------
  function pushMessage(msg) {
    // msg: { role: 'user'|'assistant', text, source? }
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }

  // ---------- typewriter animation for assistant responses ----------
  // Show typing indicator, then gradually append characters to a new assistant message
  function typeAssistantResponse(fullText, source = null, options = {}) {
    const speed = options.speed || 18; // ms per char
    setIsTyping(true);

    // create placeholder assistant message (initially empty)
    const placeholderId = Date.now() + Math.random();
    setMessages(prev => [...prev, { id: placeholderId, role: "assistant", text: "" }]);

    let idx = 0;
    const timer = setInterval(() => {
      idx += 1;
      setMessages(prev => prev.map(m => m.id === placeholderId ? { ...m, text: fullText.slice(0, idx) } : m));
      if (idx >= fullText.length) {
        clearInterval(timer);
        setIsTyping(false);
        // append source line if present
        if (source) {
          setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + Math.random(), role: "assistant", text: `Source: ${source}` }]);
          }, 220); // small delay before showing source
        }
      }
    }, speed);
  }

  // ---------- main submit handler (for input form) ----------
  function handleSubmit(e) {
    e?.preventDefault();
    const text = (input || "").trim();
    if (!text) return;

    // show user message
    pushMessage({ role: "user", text });
    setInput("");
    setShowSuggestions(false);

    // try to find FAQ answer
    const hit = findAnswer(text);
    if (hit) {
      // show typewriter assistant response
      typeAssistantResponse(hit.answer, hit.source);
    } else {
      // fallback: be honest and helpful with suggestions
      const fallback = "I don't have that exact information in my sources. Would you like me to show related projects, or do you want a short summary instead?";
      typeAssistantResponse(fallback);
    }
  }

  // ---------- suggestion chip handler ----------
  function handleSuggestionClick(s) {
    // simulate user click
    pushMessage({ role: "user", text: s.text });
    setShowSuggestions(false);

    // find answer (some chips might map to content in faq)
    const hit = findAnswer(s.text);
    if (hit) {
      typeAssistantResponse(hit.answer, hit.source);
      return;
    }

    // If not found via FAQ, we provide curated answers for the chips explicitly (safe)
    // This block ensures chips always respond even if faq.json keys differ.
    const curated = {
      experience: "I have around 5 years of experience designing B2C and B2B products across telecom, fintech, travel, and enterprise dashboards. I've worked with brands like Verizon, Southwest Airlines, Deloitte, Takeda, Texas Capital Bank, and Cvent.",
      impact: "My Verizon subscription redesign is a key project — I improved mobile engagement, clarified purchase flows, and increased conversions through clearer hierarchy and mobile-first patterns.",
      who: "I’m Pragati — a Product & UX Designer who focuses on clarity and simplifying complex flows into intuitive, build-ready solutions.",
      approach: "I break problems into decisions, map flows, validate quickly with prototypes, then refine UI. My process: Problem → Flow → Wireframes → Test → UI → Handoff.",
      values: "I prioritise clarity, reduced friction, and measurable impact—design that helps people finish tasks faster and with less effort.",
      current: "I’m working on mobile-first subscription journeys, including enrollment, upgrade flows, and A/B testing to improve activation and retention."
    };

    const cur = curated[s.key];
    if (cur) typeAssistantResponse(cur);
    else typeAssistantResponse("I can share details on that—what particular area would you like to know more about?");
  }

  // ---------- small UI helpers ----------
  function renderMessageBubble(m) {
    const isUser = m.role === "user";
    return (
      <div key={m.id} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 18 }}>
        <div style={{
          background: isUser ? BRAND.blue : "#f7fbff",
          color: isUser ? "#fff" : "#061425",
          padding: "12px 16px",
          borderRadius: 12,
          maxWidth: "78%",
          boxShadow: isUser ? "0 6px 24px rgba(15,128,217,0.14)" : "0 8px 30px rgba(2,6,23,0.03)",
          lineHeight: 1.45
        }}>
          {m.text}
        </div>
      </div>
    );
  }

  // ---------- initial hero message (shown once on mount) ----------
  useEffect(() => {
    // only show hero once if messages empty
    if (messages.length === 0) {
      pushMessage({ role: "assistant", text: "Hey there! Can I help you with anything?\nReady to assist you with anything you need." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- component UI ----------
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fbfeff", borderRadius: 12, overflow: "hidden" }}>
      {/* Header (simple top bar with brand) */}
      <div style={{ padding: 18, borderBottom: "1px solid rgba(2,6,23,0.03)" }}>
        <div style={{ color: BRAND.blue, fontWeight: 700, fontSize: 20 }}>Pragati's Assistant</div>
      </div>

      {/* Middle scrollable chat area */}
      <div ref={middleRef} style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {/* Hero/Title area */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)` }} />
          <div>
            <h2 style={{ color: BRAND.blue, margin: 0, fontSize: 32, fontWeight: 700 }}>Hey there! Can I help you with anything?</h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        {/* Message list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map(m => renderMessageBubble(m))}
        </div>

        {/* typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <div style={{ width: 40, height: 28, background: "#f0f7ff", borderRadius: 8 }} />
            <div style={{ fontStyle: "italic", color: "#6b7280" }}>Pragati's assistant is typing…</div>
          </div>
        )}
      </div>

      {/* Sticky footer area (padded container) */}
      <div style={{ padding: BRAND.footerGap, background: "transparent", borderTop: "1px solid rgba(2,6,23,0.02)" }}>
        <div style={{
          margin: `0 ${BRAND.footerGap}px`,
          background: "#fff",
          borderRadius: 14,
          padding: 16,
          boxShadow: "0 20px 60px rgba(2,6,23,0.06)"
        }}>
          {/* suggestion chips */}
          {showSuggestions && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 14,
                    border: "1px solid #f3f6fa",
                    background: "#fff",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(2,6,23,0.04)"
                  }}
                >
                  <span style={{ marginRight: 8 }}>{s.emoji}</span>{s.text}
                </button>
              ))}
            </div>
          )}

          {/* input form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                fontSize: 16
              }}
              aria-label="Ask anything"
            />
            <button type="submit" style={{
              minWidth: 92,
              height: 48,
              borderRadius: 12,
              background: BRAND.blue,
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            }}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
