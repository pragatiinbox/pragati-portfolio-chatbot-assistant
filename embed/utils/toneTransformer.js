// embed/utils/toneTransformer.js
// Configurable tone transformer for assistant replies.
// Usage:
// import { transformAnswer } from './embed/utils/toneTransformer';
// const out = transformAnswer(rawAnswer, { tone: 'warm', firstPerson: true, suggestions: true });

const PRESETS = {
  warm: {
    introOptions: [
      "Sure — here's a clear breakdown 😊",
      "Absolutely — happy to explain this!",
      "Of course — let me walk you through it.",
      "I'd love to share more about this."
    ],
    endingOptions: [
      "If you'd like, I can explain another part too.",
      "Happy to dive deeper if you'd like!",
      "Let me know if you want an example.",
      "I can walk you through a related project as well."
    ],
    emojiFreq: 0.25, // 25% of responses include a light emoji
    style: "friendly"
  },
  professional: {
    introOptions: [
      "Here is a concise overview:",
      "Happy to clarify — summary below:",
      "Summary and next steps:"
    ],
    endingOptions: [
      "If you'd like further detail, I can expand.",
      "Tell me if you want examples or data.",
      "I can follow up with a concise checklist."
    ],
    emojiFreq: 0.05,
    style: "formal"
  },
  concise: {
    introOptions: ["Quick answer:"],
    endingOptions: ["Tell me if you'd like more."],
    emojiFreq: 0.0,
    style: "concise"
  }
};

// Small helper: random pick
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// sanitize raw answer a bit
function clean(text) {
  return (text || "").trim();
}

export function transformAnswer(rawAnswer, opts = {}) {
  // opts: { tone: 'warm'|'professional'|'concise', firstPerson: boolean, suggestions: boolean, suggestionsCount: number, emojiOverride: null|true|false }
  const { tone = "warm", firstPerson = true, suggestions = true, suggestionsCount = 3, emojiOverride = null } = opts;
  const preset = PRESETS[tone] || PRESETS.warm;
  const raw = clean(rawAnswer);
  if (!raw) return "";

  // Build intro
  const intro = pick(preset.introOptions);

  // Possibly convert 3rd person -> 1st person small transformation
  let body = raw;
  if (firstPerson) {
    // small heuristic replacements — keep safe and conservative
    // Replace "the assistant" or "the bot" etc. with "I"
    body = body.replace(/\bthe assistant\b/ig, "I");
    body = body.replace(/\bthis assistant\b/ig, "I");
    body = body.replace(/\bthe bot\b/ig, "I");
    // Replace "the designer" -> "I" only if ambiguous - keep conservative
    // Note: do not attempt deep grammatical conversions to avoid errors.
  }

  // Possibly add subtle emoji
  const useEmoji = (emojiOverride === true) || (emojiOverride === null && Math.random() < preset.emojiFreq);
  const emojiAtEnd = useEmoji ? " 🙂" : "";

  // Build follow-ups (light)
  let followUpsText = "";
  if (suggestions) {
    // Create a few generic follow-ups that are likely helpful
    const possible = [
      "Would you like a quick example?",
      "Want a short checklist or step-by-step?",
      "Should I show a related case study?",
      "Do you want code samples or a simpler summary?",
      "Would you like follow-up resources?"
    ];
    // random select suggestionsCount unique picks
    const picks = [];
    const pool = possible.slice();
    for (let i = 0; i < Math.min(suggestionsCount || 3, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    followUpsText = `\n\n**What I can do next:**\n- ${picks.join("\n- ")}`;
  }

  const ending = pick(preset.endingOptions) + emojiAtEnd;

  // Combine using a safe structure
  // Keep intro separated so UI can optionally style it (we return as plain text)
  const final = `${intro}\n\n${body}\n\n${ending}${followUpsText}`;
  return final;
}
