function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeeklyReport(tasks) {
  const now = new Date();
  const start = startOfWeek(now);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const weeklyTasks = tasks.filter((task) => {
    const created = new Date(task.createdAt || now);
    if (Number.isNaN(created.getTime())) return false;
    return created >= start && created < end;
  });

  const completedWeekly = tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedAt = new Date(task.completedAt);
    if (Number.isNaN(completedAt.getTime())) return false;
    return completedAt >= start && completedAt < end;
  });

  const plannedMinutes = weeklyTasks.reduce((sum, task) => sum + (task.duration || 0), 0);
  const focusMinutes = weeklyTasks.reduce((sum, task) => sum + (task.focusMinutes || 0), 0);
  const completionRate = weeklyTasks.length
    ? Math.round((completedWeekly.length / weeklyTasks.length) * 100)
    : 0;

  return {
    weekLabel: `${start.toDateString()} - ${new Date(end.getTime() - 1).toDateString()}`,
    tasksAdded: weeklyTasks.length,
    tasksCompleted: completedWeekly.length,
    plannedMinutes,
    focusMinutes,
    completionRate
  };
}
