export function tasksToCSV(tasks) {
  const header = [
    "id",
    "subject",
    "name",
    "duration",
    "priority",
    "completed",
    "dueDate",
    "recurrence",
    "focusMinutes"
  ];

  const rows = tasks.map((task) =>
    [
      task.id,
      task.subject,
      task.name,
      task.duration,
      task.priority,
      task.completed,
      task.dueDate || "",
      task.recurrence || "None",
      task.focusMinutes || 0
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

export function tasksToPrintableReport(tasks) {
  const pending = tasks.filter((t) => !t.completed);
  const completed = tasks.length - pending.length;
  const totalFocus = tasks.reduce((sum, t) => sum + (t.focusMinutes || 0), 0);
  const lines = [
    "AI Smart Study Planner - Report",
    `Generated: ${new Date().toLocaleString()}`,
    `Total tasks: ${tasks.length}`,
    `Completed: ${completed}`,
    `Pending: ${pending.length}`,
    `Focus minutes: ${totalFocus}`,
    "",
    "Top pending tasks:"
  ];

  pending.slice(0, 8).forEach((task, index) => {
    lines.push(`${index + 1}. ${task.subject} - ${task.name} (${task.duration}m, ${task.priority})`);
  });

  return lines.join("\n");
}

