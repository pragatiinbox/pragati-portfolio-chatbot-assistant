import { addWarmTone } from "./utils/toneTransformer";
import { findBestMatch } from "./utils/matcher";
import { getSuggestions } from "./utils/suggestions";

async function handleUserMessage(userMessage) {
  setMessages(prev => [...prev, { sender: "user", text: userMessage }]);

  const res = await fetch("/faq.json");
  const faqData = await res.json();

  const match = findBestMatch(userMessage, faqData);

  let botResponse = "";
  let suggestions = [];

  if (match) {
    botResponse = addWarmTone(match.a);
    suggestions = getSuggestions(match.q);
  } else {
    botResponse = `I might not have the perfect answer yet, but I’d love to help! Could you try rephrasing it a bit? I’ll do my best to guide you. 😊`;
    suggestions = [
      "Show me a project",
      "Tell me about your experience",
      "Explain your design process"
    ];
  }

  setMessages(prev => [
    ...prev,
    { sender: "assistant", text: botResponse, suggestions }
  ]);
}
