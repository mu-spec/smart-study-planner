export function buildRecoveryPlan(tasks, dailyMinutes = 120) {
  const pending = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const rank = { High: 3, Medium: 2, Low: 1 };
      return (rank[b.priority] || 0) - (rank[a.priority] || 0);
    });

  const backlogMinutes = pending.reduce((sum, t) => sum + (t.duration || 0), 0);
  const targetMinutes = Math.max(60, Number(dailyMinutes) || 120);
  const extraMinutes = Math.min(90, Math.round(backlogMinutes * 0.2));
  const adaptiveTarget = targetMinutes + extraMinutes;

  const days = [];
  let remaining = pending.map((t) => ({ ...t }));
  for (let i = 0; i < 5; i += 1) {
    const day = new Date();
    day.setDate(day.getDate() + i);
    let budget = adaptiveTarget;
    const items = [];
    const nextRemaining = [];
    for (const task of remaining) {
      const duration = task.duration || 0;
      if (duration <= budget) {
        items.push(task);
        budget -= duration;
      } else {
        nextRemaining.push(task);
      }
    }
    days.push({ date: day.toISOString().slice(0, 10), items, plannedMinutes: adaptiveTarget - budget });
    remaining = nextRemaining;
  }

  return {
    backlogMinutes,
    adaptiveTarget,
    days,
    remainingCount: remaining.length
  };
}
