const priorityWords = {
  high: "High",
  medium: "Medium",
  low: "Low"
};

export function parseVoiceTaskTranscript(input) {
  const text = String(input || "").trim();
  if (!text) return null;

  const minutesMatch = text.match(/(\d+)\s*(min|mins|minute|minutes)/i);
  const duration = minutesMatch ? Number(minutesMatch[1]) : 30;

  const priorityMatch = Object.keys(priorityWords).find((word) =>
    text.toLowerCase().includes(word)
  );
  const priority = priorityMatch ? priorityWords[priorityMatch] : "Medium";

  const parts = text.split(":");
  const subject = parts.length > 1 ? parts[0].trim() : "General Study";
  const name = parts.length > 1 ? parts.slice(1).join(":").trim() : text;

  return {
    subject: subject || "General Study",
    name: name || "Study session",
    duration: Number.isFinite(duration) ? duration : 30,
    priority
  };
}
