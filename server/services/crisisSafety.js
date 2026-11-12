const CRISIS_PATTERNS = [
  /\b(?:suicid(?:e|al|ality)|self[\s-]?harm)\b/i,
  /\b(?:kill|hurt|harm)(?:ing)? myself\b/i,
  /\b(?:take|end) my own life\b/i,
  /\b(?:end|ending) my life\b/i,
  /\b(?:don't|do not|dont) want to live\b/i,
  /\bwant(?:ing)? to die\b/i,
  /\bbetter off dead\b/i,
  /\b(?:overdos(?:e|ing)|can't keep myself safe|cannot keep myself safe)\b/i,
];

export function containsCrisisSignal(message) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(message));
}

export const crisisReply = "I'm really glad you told me. I'm sorry you're facing this, and you deserve support from a real person right now. If you may act on these thoughts or are in immediate danger, call your local emergency number now or go to the nearest emergency department. If you can, move near someone you trust and tell them plainly that you may not be safe alone. You can find a verified crisis line for your country at findahelpline.com. Are you in immediate danger right now?";
