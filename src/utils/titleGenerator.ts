/**
 * Automatically generates a concise, clean chat title from the first user question.
 * Example: "Explain VLSI" -> "VLSI Basics"
 * Example: "Write Python code for a calculator" -> "Python Calculator"
 */
export function generateChatTitle(prompt: string): string {
  const clean = prompt.trim();
  if (!clean) return 'New Chat';

  // Common pattern replacements
  const lower = clean.toLowerCase();

  if (lower.startsWith('explain vlsi')) {
    return 'VLSI Basics';
  }
  if (lower.includes('code for a calculator') || lower.includes('python code for a calculator')) {
    return 'Python Calculator';
  }
  if (lower.includes('study plan')) {
    return 'Study Plan';
  }
  if (lower.includes('debug my code') || lower.includes('help me debug')) {
    return 'Code Debugging';
  }
  if (lower.includes('step by step')) {
    const concept = clean.replace(/explain|this|concept|step by step/gi, '').trim();
    return concept ? `${concept} Step-by-Step` : 'Step-by-Step Guide';
  }

  // Remove common starter prefixes
  let title = clean
    .replace(/^(can you please |please |can you |could you |would you )/i, '')
    .replace(/^(explain to me |explain |tell me about |what is |what are |how does |how do i |how to |write a |write |create a |create |give me a |give me )/i, '')
    .replace(/[?!.:,;]+$/g, '')
    .trim();

  // If title was "VLSI", append "Basics" or "Overview"
  if (clean.toLowerCase().startsWith('explain ') && title.length < 15) {
    title = `${title} Basics`;
  }

  if (!title) {
    title = clean.slice(0, 30);
  }

  // Capitalize words nicely
  title = title
    .split(/\s+/)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return title.slice(0, 36) || 'New Conversation';
}
