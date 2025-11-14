// embed/utils/toneTransformer.js
export function addWarmTone(rawAnswer) {
  if (!rawAnswer || rawAnswer.trim() === "") return "";

  // Light intros to soften tone
  const warmIntros = [
    "Sure! Here's a clear breakdown 😊",
    "Absolutely — happy to explain this!",
    "Of course! Let me walk you through it.",
    "I'd love to share more about this.",
    "Here’s a quick, clear overview:"
  ];

  const intro = warmIntros[Math.floor(Math.random() * warmIntros.length)];

  // Soft endings for natural flow
  const warmEndings = [
    "If you want, I can explain another part too.",
    "Happy to dive deeper if you'd like!",
    "Let me know if you want an example.",
    "I can walk you through a related project as well.",
    "Feel free to ask me anything else!"
  ];

  const ending = warmEndings[Math.floor(Math.random() * warmEndings.length)];

  return `${intro}\n\n${rawAnswer}\n\n${ending} 🙂`;
}
