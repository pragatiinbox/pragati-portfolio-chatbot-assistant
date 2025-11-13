// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/**
 * ChatAssistant (Pangaia/Poppins style, brand blue #0f80d9)
 *
 * - Replace your current components/ChatAssistant.jsx with this file.
 * - If you want the exact PANGAIA font, see the @font-face instructions below.
 * - Uses inline Feather-like SVG icons (no external icon lib).
 */

const BRAND = {
  blue: "#0f80d9",
  bg: "#ffffff",
  softGray: "#f6f7f9",
  text: "#061425",
  muted: "#6b7280",
  radius: 18,
  shadow: "0 30px 80px rgba(2,6,23,0.08)"
};

// suggested questions — edit these lines to change the wording
const SUGGESTED = [
  { key: "mobile", text: "Show me your best mobile project", icon: "📱" },
  { key: "research", text: "How do you approach research?", icon: "🔬" },
  { key: "tools", text: "Which tools do you use?", icon: "🧰" },
  { key: "about", text: "Who is Pragati?", icon: "👋" }
];

// small FAQ repository; update/add entries to match your voice
const FAQS = [
  {
    keys: ["what tools", "tools do you use", "which tools"],
    answer:
      "I primarily use Figma for UI, Protopie for interactions, FigJam for workshops and Notion for documentation. I validate with Maze."
  },
  {
    keys: ["design process", "process", "how do you design"],
    answer:
      "Research → sketch → prototype → validate. I prioritise high-risk hypotheses and test with quick prototypes to reduce uncertainty."
  },
  {
    keys: ["who is pragati", "who is pragati sharma", "about pragati"],
    answer:
      "Pragati Sharma — Product Designer creating scalable, empathetic design systems. Check out her case studies linked above."
  },
  {
    keys: ["experience", "industry", "worked"],
    answer:
      "I've worked across fintech, telecom and SaaS with a focus on measurable outcomes (conversion, retention, task success)."
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

/* Inline Feather-like SVGs */
function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1v11" stroke={BRAND.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 11a7 7 0 01-14 0" stroke={BRAND.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 21v-4" stroke={BRAND.blue} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22l-3-9-9-3 19-7z" fill={BRAND.blue} opacity="0.06"/>
    </svg>
  );
}

export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there — can I help you with anything?" },
    { role: "assistant-sub", text: "Ready to assist you with anything you need." }
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [stage, setStage] = useState("intro");
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

  function handleSuggested(s) {
    addMessage({ role: "user", text: s.text });
    // check FAQ
    const faq = findFaq(s.text);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      return;
    }
    // canned behaviour per suggestion key
    if (s.key === "mobile") {
      const txt = `My top mobile project is "Mobile Checkout Redesign" — Checkout flow & microinteractions. View: https://pragatisharma.in/mobile-checkout`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "research") {
      const txt = "I start with stakeholder interviews, map assumptions, then run 2–3 rapid tests to validate direction.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "tools") {
      const txt = "Figma, Protopie, FigJam, Notion, Maze. I pick tools based on fidelity & research needs.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    if (s.key === "about") {
      const txt = "Pragati Sharma is a product designer crafting scalable product experiences. Check case studies linked on the site.";
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      return;
    }
    // fallback
    addMessage({ role: "assistant", text: "Thanks — I got that. Ask me to open a case study or request more details." });
    speak("Thanks — I got that.");
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
    e.preventDefault();
    if (!input.trim()) return;
    addMessage({ role: "user", text: input });
    // FAQ check
    const faq = findFaq(input);
    if (faq) {
      addMessage({ role: "assistant", text: faq });
      speak(faq);
      setInput("");
      return;
    }
    // simple keyword fallback: open project if user asks
    const lower = input.toLowerCase();
    if (lower.includes("mobile") && lower.includes("project")) {
      const txt = `My mobile case study: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`;
      addMessage({ role: "assistant", text: txt });
      speak(txt);
      setInput("");
      return;
    }
    // default fallback
    const fallback = `I heard: "${input}". I can open a case study, share process notes, or provide hiring highlights.`;
    addMessage({ role: "assistant", text: fallback });
    speak(fallback);
    setInput("");
  }

  return (
    <div style={{
      minHeight: "100%",
      display: "flex",
      flexDirection: "column",
      background: BRAND.blue ? BRAND?.bg : "#fff"
    }}>
      {/* header / big hero area */}
      <div style={{
        padding: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        background: "#fff"
      }}>
        <div style={{ width: 86, height: 86, borderRadius: 18, background: "linear-gradient(135deg, rgba(15,128,217,0.06), rgba(15,128,217,0.02))", display: "grid", placeItems: "center", boxShadow: "0 8px 30px rgba(15,128,217,0.06)" }}>
          {/* small orb placeholder */}
          <div style={{ width: 46, height: 46, borderRadius: 12, background: `linear-gradient(145deg, ${BRAND.blue}, #a6d9ff)`, boxShadow: "0 8px 20px rgba(15,128,217,0.08)" }} />
        </div>

        <h1 style={{ margin: 0, fontFamily: "'Pangaia', 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", fontSize: 42, lineHeight: 1.02, color: BRAND.blue, textAlign: "center", fontWeight: 600 }}>
          Hey there!<br/>Can I help you with anything?
        </h1>

        <p style={{ margin: 0, marginTop: 6, color: "#6b7280", textAlign: "center", fontSize: 16 }}>
          Ready to assist you with anything you need.
        </p>
      </div>

      {/* input area */}
      <div style={{ padding: "36px 56px", display: "flex", flexDirection: "column", gap: 18 }}>
        <form onSubmit={onSubmit} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            aria-label="Ask anything you need"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything you need"
            style={{
              flex: 1,
              padding: "18px 20px",
              borderRadius: 14,
              border: `1px solid ${BRAND.softGray}`,
              fontSize: 16,
              boxShadow: "0 8px 30px rgba(10,20,40,0.04)",
              background: "#fff",
              outline: "none"
            }}
          />

          <button type="button" onClick={toggleMic} title="Speak" style={{
            display: "grid", placeItems: "center", borderRadius: 10, border: `1px solid ${BRAND.softGray}`, padding: 10, background: "#fff", cursor: "pointer", boxShadow: "0 6px 18px rgba(10,20,40,0.04)"
          }}>
            <IconMic />
          </button>

          <button type="submit" title="Send" style={{
            display: "flex", gap: 8, alignItems: "center", background: BRAND.blue, color: "#fff", border: "none", padding: "12px 18px", borderRadius: 12, cursor: "pointer", boxShadow: "0 10px 30px rgba(15,128,217,0.18)"
          }}>
            <span style={{ fontWeight: 600 }}>Send</span>
            <IconSend />
          </button>
        </form>

        {/* suggested questions row */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
          {SUGGESTED.map((s, i) => (
            <button key={i} onClick={() => handleSuggested(s)} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 14,
              border: `1px solid ${BRAND.softGray}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
              color: BRAND.text,
              boxShadow: "0 8px 24px rgba(10,20,40,0.04)"
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>

        {/* conversation area (light) */}
        <div ref={containerRef} style={{ marginTop: 8, padding: 12, borderRadius: 14, background: "#fff", minHeight: 180, boxShadow: "inset 0 1px 0 rgba(10,20,40,0.02)" }}>
          {messages.map((m, idx) => (
            <div key={idx} style={{ marginBottom: 12, display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                maxWidth: "78%",
                padding: "12px 14px",
                borderRadius: 12,
                background: m.role === "user" ? BRAND.blue : "#f8fbff",
                color: m.role === "user" ? "#fff" : BRAND.text,
                boxShadow: "0 6px 18px rgba(10,20,40,0.04)"
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
