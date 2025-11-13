// components/ChatAssistant.jsx
import { useEffect, useRef, useState } from "react";

/* Brand variables */
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
  { keys: ["who is pragati", "who is pragati sharma"], answer: "Pragati Sharma is a product designer building scalable, empathetic design systems. See case studies on the site." },
  { keys: ["experience", "industry", "worked"], answer: "I've worked across fintech, telecom and SaaS with a focus on measurable outcomes." }
];

function findFaq(text){ const t = (text||"").toLowerCase(); for(const f of FAQS){ for(const k of f.keys){ if(t.includes(k)) return f.answer } } return null; }

/* Feather icons inline */
function IconMic({ stroke = BRAND.blue, size = 18 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 1v11" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 11a7 7 0 01-14 0" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 21v-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSend({ stroke = "#fff", size = 16 }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 2L11 13" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2L15 22l-3-9-9-3 19-7z" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.06"/>
    </svg>
  );
}

export default function ChatAssistant({ projects = [] }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey there! Can I help you with anything?" },
    { role: "assistant-sub", text: "Ready to assist you with anything you need." }
  ]);
  const [input, setInput] = useState("");
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition) return;
    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e)=> {
      const t = e.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + t : t));
    };
    r.onend = () => setListening(false);
    recRef.current = r;
  }, []);

  useEffect(() => {
    if(!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  function speak(text){
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
  }

  function addMessage(m){ setMessages(prev => [...prev, m]); }

  function handleSuggestion(s){
    addMessage({ role: "user", text: s.text });
    const faq = findFaq(s.text);
    if(faq){ addMessage({ role: "assistant", text: faq }); speak(faq); return; }
    if(s.key === "mobile"){ const txt = `My top mobile project: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if(s.key === "research"){ const txt = "I start with stakeholder interviews, map assumptions, and run 2–3 rapid tests to validate direction."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if(s.key === "tools"){ const txt = "Figma, Protopie, FigJam, Notion, Maze — chosen per stage and fidelity."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    if(s.key === "about"){ const txt = "Pragati Sharma is a product designer creating thoughtful, scalable product experiences."; addMessage({ role: "assistant", text: txt }); speak(txt); return; }
    addMessage({ role: "assistant", text: "Thanks — I got that. Ask me to open a case study or request more details." });
    speak("Thanks — I got that.");
  }

  function toggleMic(){
    if(!recRef.current){ alert("Speech recognition not supported in this browser (try Chrome)"); return; }
    if(listening){ recRef.current.stop(); setListening(false); } else { recRef.current.start(); setListening(true); }
  }

  function onSubmit(e){
    e?.preventDefault();
    if(!input.trim()) return;
    addMessage({ role: "user", text: input });
    const faq = findFaq(input);
    if(faq){ addMessage({ role: "assistant", text: faq }); speak(faq); setInput(""); return; }
    const lower = input.toLowerCase();
    if(lower.includes("mobile") && lower.includes("project")){ const txt = `My mobile case study: Mobile Checkout Redesign — https://pragatisharma.in/mobile-checkout`; addMessage({ role: "assistant", text: txt }); speak(txt); setInput(""); return; }
    const fallback = `I heard: "${input}". I can open a case study, give a short summary, or share hiring highlights.`;
    addMessage({ role: "assistant", text: fallback }); speak(fallback); setInput("");
  }

  /* styles (inline JS) */
  const styles = {
    outer: { display: "flex", flexDirection: "column", height: "100%", background: BRAND.pale, fontFamily: "var(--font-body)" },
    hero: { padding: "28px 36px", textAlign: "center", background: `linear-gradient(180deg, rgba(15,128,217,0.04), rgba(15,128,217,0.01))` },
    orb: { width: 76, height: 76, borderRadius: 16, margin: "0 auto 12px", display: "grid", placeItems: "center", background: `linear-gradient(135deg, rgba(15,128,217,0.08), rgba(15,128,217,0.02))`, boxShadow: "0 8px 30px rgba(15,128,217,0.06)" },
    title: { margin: 0, fontFamily: "var(--font-heading)", color: BRAND.blue, fontSize: 36, lineHeight: 1.02, fontWeight: 700 },
    subtitle: { marginTop: 8, color: BRAND.muted, fontSize: 14 },
    body: { padding: "20px 40px", display: "flex", flexDirection: "column", gap: 12, flex: 1, overflow: "hidden" },
    formRow: { display: "flex", gap: 12, alignItems: "center" },
    input: { flex: 1, padding: "14px 18px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, background: "#fff", fontSize: 15 },
    micBtn: { borderRadius: 12, padding: 10, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer" },
    sendBtn: { padding: "10px 14px", borderRadius: 12, background: BRAND.blue, color: "#fff", border: "none", cursor: "pointer", display: "flex", gap: 8, alignItems: "center" },
    suggestions: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 },
    suggestionBtn: { padding: "10px 14px", borderRadius: 14, border: `1px solid ${BRAND.softGray}`, background: "#fff", cursor: "pointer", fontSize: 14, boxShadow: "0 8px 24px rgba(10,20,40,0.04)" },
    convoWrap: { marginTop: 6, flex: 1, overflow: "auto", padding: 8, borderRadius: 12, background: "#fff" },
    bubbleAssistant: { padding: "10px 12px", background: "#f7fbff", borderRadius: 12, color: BRAND.text, maxWidth: "82%", marginBottom: 10 },
    bubbleUser: { padding: "10px 12px", background: BRAND.blue, color: "#fff", borderRadius: 12, maxWidth: "82%", marginBottom: 10 }
  };

  return (
    <div style={styles.outer}>
      <div style={styles.hero}>
        <div style={styles.orb}><div style={{ width: 44, height: 44, borderRadius: 10, background: `linear-gradient(145deg, ${BRAND.blue}, #a6d9ff)` }} /></div>
        <h2 style={styles.title}>Hey there! Can I help you with anything?</h2>
        <div style={styles.subtitle}>Ready to assist you with anything you need.</div>
      </div>

      <div style={styles.body}>
        <form onSubmit={onSubmit} style={styles.formRow}>
          <input aria-label="Ask anything" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything you need" style={styles.input} />
          <button type="button" onClick={toggleMic} aria-label="Speak" style={styles.micBtn}><IconMic /></button>
          <button type="submit" aria-label="Send" style={styles.sendBtn}><span style={{ fontWeight: 600 }}>Send</span><IconSend /></button>
        </form>

        <div style={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => handleSuggestion(s)} style={styles.suggestionBtn}>
              <span style={{ marginRight: 8 }}>{s.emoji}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>

        <div ref={containerRef} style={styles.convoWrap}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
