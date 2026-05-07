function getPending(tasks) {
  return tasks.filter((task) => !task.completed);
}

export function getSmartSuggestions(tasks, availableHours = 4) {
  const pending = getPending(tasks);
  if (!pending.length) {
    return ["You are fully caught up. Add a new goal and keep your streak alive."];
  }

  const top = [...pending].sort((a, b) => {
    const rank = { High: 3, Medium: 2, Low: 1 };
    return (rank[b.priority] || 0) - (rank[a.priority] || 0);
  });

  const suggestions = [];
  const totalMinutes = pending.reduce((sum, t) => sum + (t.duration || 0), 0);
  const budget = Math.max(1, Number(availableHours)) * 60;

  if (totalMinutes > budget) {
    suggestions.push(
      `Backlog alert: ${totalMinutes}m pending vs ${budget}m available. Focus on top 2 high-priority tasks first.`
    );
  }

  const overdue = pending.filter((t) => t.dueDate && new Date(t.dueDate) < new Date());
  if (overdue.length) {
    suggestions.push(`You have ${overdue.length} overdue task(s). Run Smart Reschedule before planning.`);
  }

  const weakestSubject = pending.reduce(
    (acc, t) => {
      const subject = t.subject || "General";
      const focus = t.focusMinutes || 0;
      if (!acc[subject]) acc[subject] = { duration: 0, focus: 0 };
      acc[subject].duration += t.duration || 0;
      acc[subject].focus += focus;
      return acc;
    },
    {}
  );

  const weak = Object.entries(weakestSubject)
    .map(([subject, value]) => ({
      subject,
      gap: value.duration - value.focus
    }))
    .sort((a, b) => b.gap - a.gap)[0];

  if (weak && weak.gap > 45) {
    suggestions.push(`Weakest progress: ${weak.subject}. Add one focused 25m Pomodoro there today.`);
  }

  suggestions.push(`Best next task: ${top[0].subject} - ${top[0].name} (${top[0].duration}m).`);
  return suggestions.slice(0, 4);
}

