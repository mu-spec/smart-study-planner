function dateKey(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function previousDateKey(key) {
  const date = new Date(`${key}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return dateKey(date.toISOString());
}

export function getStudyStreak(tasks) {
  const completionDays = Array.from(
    new Set(
      tasks
        .filter((task) => task.completed && task.completedAt)
        .map((task) => dateKey(task.completedAt))
        .filter(Boolean)
    )
  ).sort();

  if (completionDays.length === 0) return 0;

  const todayKey = dateKey(new Date().toISOString());
  let cursor = completionDays.includes(todayKey) ? todayKey : previousDateKey(todayKey);
  let streak = 0;

  while (completionDays.includes(cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }

  return streak;
}

export function getSubjectAnalytics(tasks) {
  const map = {};

  for (const task of tasks) {
    if (!map[task.subject]) {
      map[task.subject] = {
        subject: task.subject,
        totalTasks: 0,
        completedTasks: 0,
        plannedMinutes: 0,
        completedMinutes: 0,
        focusMinutes: 0
      };
    }

    const item = map[task.subject];
    item.totalTasks += 1;
    item.plannedMinutes += task.duration || 0;
    item.focusMinutes += task.focusMinutes || 0;
    if (task.completed) {
      item.completedTasks += 1;
      item.completedMinutes += task.duration || 0;
    }
  }

  return Object.values(map).sort((a, b) => b.plannedMinutes - a.plannedMinutes);
}
