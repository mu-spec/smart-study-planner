export function tasksToICS(tasks) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Smart Study Planner//EN"
  ];

  tasks
    .filter((task) => task.dueDate)
    .forEach((task) => {
      const due = new Date(task.dueDate);
      if (Number.isNaN(due.getTime())) return;
      const start = formatDateUTC(due);
      const endDate = new Date(due);
      endDate.setMinutes(endDate.getMinutes() + Math.max(15, task.duration || 30));
      const end = formatDateUTC(endDate);
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${task.id || Date.now()}@ai-smart-study-planner`);
      lines.push(`DTSTAMP:${formatDateUTC(new Date())}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${escapeText(`${task.subject}: ${task.name}`)}`);
      lines.push(`DESCRIPTION:${escapeText(`Priority ${task.priority || "Medium"}`)}`);
      lines.push("END:VEVENT");
    });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function formatDateUTC(date) {
  const d = new Date(date);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate()
  ).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(
    d.getUTCMinutes()
  ).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}Z`;
}

function escapeText(value) {
  return String(value || "").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}
