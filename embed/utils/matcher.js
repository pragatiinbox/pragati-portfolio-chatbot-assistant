// Simple fuzzy match to allow typos & partials
function fuzzyScore(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  let score = 0;
  const aWords = a.split(" ");
  const bWords = b.split(" ");

  aWords.forEach(aw => {
    bWords.forEach(bw => {
      if (aw.startsWith(bw) || bw.startsWith(aw)) score += 2;
      if (aw.includes(bw) || bw.includes(aw)) score += 1;
      if (aw === bw) score += 3;
    });
  });

  return score;
}

export function findBestMatch(input, faqData) {
  let best = null;
  let bestScore = 0;

  faqData.forEach(section => {
    section.qa.forEach(item => {
      const combined = item.q + " " + section.title + " " + (item.keywords || []).join(" ");

      const score = fuzzyScore(input, combined);

      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
  });

  // Threshold — ensures we don't answer nonsense
  if (bestScore < 3) return null;

  return best;
}
