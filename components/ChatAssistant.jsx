// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/* ---------- CONFIG ---------- */
const BRAND = { blue: "#0f80d9", footerGap: 24 };

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
      "I use Figma for UI & systems, FigJam for whiteboards, basic prototyping in Figma + Framer for demos, and Notion/Loom for documentation."
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

/* small typing indicator */
function TypingIndicator() {
  return (
    <div style={{ display: "inline-flex", gap: 6, padding: "8px 12px", background: "#f1f8ff", borderRadius: 12 }}>
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
  const [faqRaw, setFaqRaw] = useState([]); // raw categories as in your file
  const [faqFlat, setFaqFlat] = useState([]); // flattened entries: { question, answer, source, keywords (array) }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const middleRef = useRef(null);

  useEffect(() => {
    // load /faq.json (your nested format)
    fetch("/faq.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("no faq")))
      .then((j) => {
        setFaqRaw(j || []);
        // flatten into { question, answer, source?, keywords: [] }
        const flat = [];
        for (const category of (j || [])) {
          const catKeywords = Array.isArray(category.keywords) ? category.keywords.map(k => k.toLowerCase()) : [];
          const qaList = Array.isArray(category.qa) ? category.qa : [];
          for (const qa of qaList) {
            flat.push({
              question: (qa.q || "").trim(),
              answer: (qa.a || qa.answer || "").trim(),
              source: qa.source || qa.src || "",
              // combine category keywords + optional qa-specific keywords if present
              keywords: [
                ...catKeywords,
                ...(Array.isArray(qa.keywords) ? qa.keywords.map(k => k.toLowerCase()) : [])
              ]
            });
          }
        }
        setFaqFlat(flat);
      })
      .catch(() => {
        setFaqRaw([]);
        setFaqFlat([]);
      });
  }, []);

  useEffect(() => {
    // autoscroll when messages change
    if (!middleRef.current) return;
    setTimeout(() => {
      middleRef.current.scrollTop = middleRef.current.scrollHeight;
    }, 40);
  }, [messages]);

  const addMessage = (m) =>
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), ...m }
    ]);

  // Matching — first exact question, then qa keywords, then category keywords
  function matchFAQ(userText) {
    const t = (userText || "").trim().toLowerCase();
    if (!t) return null;

    // 1) exact question equality
    for (const e of faqFlat) {
      if (e.question.toLowerCase() === t) return e;
    }

    // 2) keyword match inside each entry keyword array
    for (const e of faqFlat) {
      if (!e.keywords || e.keywords.length === 0) continue;
      for (const kw of e.keywords) {
        if (!kw) continue;
        if (t.includes(kw)) return e;
      }
    }

    // 3) any question that includes the user's text (loose contains)
    for (const e of faqFlat) {
      if (e.question.toLowerCase().includes(t)) return e;
    }

    return null;
  }

  // show assistant "typing" then add reply
  function assistantReply(text) {
    setIsTyping(true);
    const delay = Math.min(1200 + text.length * 8, 2200);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({ role: "assistant", text });
      setShowSuggestions(false);
    }, delay);
  }

  function handleQuestion(text) {
    if (!text || !text.trim()) return;
    const t = text.trim();
    addMessage({ role: "user", text: t });
    setInput("");

    // 1) try faq match
    const hit = matchFAQ(t);
    if (hit) {
      const answer = hit.answer || "Here's what I found.";
      const reply = hit.source ? `${answer}\n\nSource: ${hit.source}` : answer;
      assistantReply(reply);
      return;
    }

    // 2) try to find by suggestion key (map suggestions to faq by keyword)
    const sMatch = SUGGESTIONS.find(s => s.text.toLowerCase() === t.toLowerCase() || s.key === t.toLowerCase());
    if (sMatch) {
      // try to find a faq that lists the suggestion key in keywords
      const byKey = faqFlat.find(f => f.keywords && f.keywords.includes(sMatch.key));
      if (byKey) {
        const reply = byKey.source ? `${byKey.answer}\n\nSource: ${byKey.source}` : byKey.answer;
        assistantReply(reply);
        return;
      }
      // else fallback to canned suggestion answer
      assistantReply(sMatch.answer);
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
    handleQuestion(s.text);
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fbfeff" }}>
      <div ref={middleRef} style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.blue}, #a6d9ff)` }} />
          <div>
            <h2 style={{ color: BRAND.blue, margin: 0, fontSize: 36, fontWeight: 700 }}>Hey there! Can I help you with anything?</h2>
            <div style={{ marginTop: 8, color: "#6b7280" }}>Ready to assist you with anything you need.</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                background: m.role === "user" ? BRAND.blue : "#f7fbff",
                color: m.role === "user" ? "#fff" : "#061425",
                padding: "12px 16px",
                borderRadius: 12,
                maxWidth: "78%",
                boxShadow: m.role === "assistant" ? "0 10px 30px rgba(2,6,23,0.03)" : "none"
              }}>
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "8px 12px", borderRadius: 12, background: "#f1f8ff" }}>
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>

        {/* bottom spacing so messages don't hide behind footer */}
        <div style={{ height: BRAND.footerGap + 90 }} />
      </div>

      <div style={{ padding: BRAND.footerGap }}>
        <div style={{ margin: `0 ${BRAND.footerGap}px`, background: "#fff", borderRadius: 14, padding: 16, boxShadow: "0 20px 60px rgba(2,6,23,0.06)" }}>
          {showSuggestions && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", marginBottom: 12 }}>
              {SUGGESTIONS.map(s => (
                <button key={s.key} onClick={() => onSuggestionClick(s)} style={{ padding: "10px 14px", borderRadius: 14, border: "1px solid #f3f6fa", background: "#fff", display: "inline-flex", alignItems: "center", gap: 8 }}>
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
