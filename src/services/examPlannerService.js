function dayStart(dateLike) {
  const date = new Date(dateLike);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysBetween(from, to) {
  const diff = dayStart(to).getTime() - dayStart(from).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function generateExamPlan({ examDate, tasks, dailyHours = 2 }) {
  const pending = tasks.filter((task) => !task.completed);
  const totalMinutes = pending.reduce((sum, task) => sum + (task.duration || 0), 0);
  const minutesPerDay = Math.max(30, dailyHours * 60);
  const daysLeft = daysBetween(new Date(), examDate);
  const requiredDays = Math.max(1, Math.ceil(totalMinutes / minutesPerDay));

  const plan = [];
  const sorted = [...pending].sort((a, b) => {
    const p = { High: 3, Medium: 2, Low: 1 };
    return (p[b.priority] || 0) - (p[a.priority] || 0);
  });

  let cursor = 0;
  for (let day = 0; day < Math.min(daysLeft, requiredDays); day += 1) {
    let remaining = minutesPerDay;
    const items = [];
    while (cursor < sorted.length && remaining >= (sorted[cursor].duration || 0)) {
      const task = sorted[cursor];
      items.push(task);
      remaining -= task.duration || 0;
      cursor += 1;
    }
    const date = new Date();
    date.setDate(date.getDate() + day);
    plan.push({ date: date.toDateString(), items, remaining });
  }

  return {
    daysLeft,
    totalMinutes,
    minutesPerDay,
    requiredDays,
    plan
  };
}
