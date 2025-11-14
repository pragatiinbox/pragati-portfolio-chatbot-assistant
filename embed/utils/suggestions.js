const suggestionMap = {
  "projects": [
    "Show me a mobile project",
    "Show me a dashboard project",
    "Walk me through your Verizon PDP"
  ],
  "process": [
    "Explain your UX process",
    "How do you collaborate with PMs?",
    "Show me a flow-heavy project"
  ],
  "experience": [
    "Tell me about your B2B work",
    "Tell me about your B2C work",
    "What industries have you worked in?"
  ],
  "design-system": [
    "Show me your design system work",
    "How do you build components?",
    "Tell me about tokens & variants"
  ],
  "soft-skills": [
    "What's your communication style?",
    "How do you give feedback?",
    "What's your teamwork style?"
  ]
};

export function getSuggestions(questionText) {
  const text = questionText.toLowerCase();

  if (text.includes("project") || text.includes("case") || text.includes("work"))
    return suggestionMap.projects;

  if (text.includes("process") || text.includes("flow") || text.includes("ux"))
    return suggestionMap.process;

  if (text.includes("experience") || text.includes("industry") || text.includes("background"))
    return suggestionMap.experience;

  if (text.includes("design system") || text.includes("tokens") || text.includes("components"))
    return suggestionMap["design-system"];

  if (text.includes("team") || text.includes("communication") || text.includes("feedback"))
    return suggestionMap["soft-skills"];

  return [
    "Show me a project",
    "Tell me your process",
    "Show me your dashboard work"
  ];
}
