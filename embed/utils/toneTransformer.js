// embed/utils/toneTransformer.js
// Simple helper that adds a friendly intro and ending to raw assistant answers.
// Import and call: addWarmTone(rawAnswer)

export function addWarmTone(rawAnswer) {
  if (!rawAnswer || rawAnswer.trim() === "") return "";

  const warmIntros = [
    "Sure — here’s a clear breakdown 😊",
    "Absolutely — happy to explain this!",
    "Of course! Let me walk you through it.",
    "I’d love to share more about this.",
    "Here’s a quick, clear overview:"
  ];

  const warmEndings = [
    "If you want, I can explain another part too.",
    "Happy to dive deeper if you'd like!",
    "Let me know if you want an example.",
    "I can walk you through a related project as well.",
    "Feel free to ask me anything else!"
  ];

  const intro = warmIntros[Math.floor(Math.random() * warmIntros.length)];
  const ending = warmEndings[Math.floor(Math.random() * warmEndings.length)];

  // Keep emojis light and end with a small friendly emoji
  return `${intro}\n\n${rawAnswer}\n\n${ending} 🙂`;
}
