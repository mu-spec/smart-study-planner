const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1
};

function parseDueDate(task) {
  if (!task?.dueDate) return null;
  const parsed = new Date(task.dueDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dayDiffFromToday(date) {
  const now = new Date();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDue = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = startDue.getTime() - startNow.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function urgencyBonus(task) {
  const due = parseDueDate(task);
  if (!due) return 0;
  const diff = dayDiffFromToday(due);
  if (diff <= 0) return 120;
  if (diff === 1) return 70;
  if (diff <= 3) return 35;
  return 0;
}

function sortTasksForPlanning(tasks) {
  return [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const dueA = parseDueDate(a);
      const dueB = parseDueDate(b);
      const duePressureA = dueA ? Math.max(0, 6 - Math.max(0, dayDiffFromToday(dueA))) * 8 : 0;
      const duePressureB = dueB ? Math.max(0, 6 - Math.max(0, dayDiffFromToday(dueB))) * 8 : 0;

      const scoreA =
        (priorityRank[a.priority] || 0) * 100 +
        urgencyBonus(a) +
        duePressureA +
        -Math.min(20, (a.focusSessions || 0) * 3);
      const scoreB =
        (priorityRank[b.priority] || 0) * 100 +
        urgencyBonus(b) +
        duePressureB +
        -Math.min(20, (b.focusSessions || 0) * 3);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.duration - b.duration;
    });
}

function timeLabel(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Basic "AI-like" heuristic:
// - higher priority first
// - longer tasks earlier while energy is typically higher
// - fill schedule until available time is consumed
export function generateDailySchedule(tasks, availableMinutes = 240, options = {}) {
  const sorted = sortTasksForPlanning(tasks);
  const schedule = [];
  const breakMinutes = Math.max(5, Number(options.breakMinutes) || 10);
  const avoidStartHour = Number.isFinite(Number(options.avoidStartHour))
    ? Number(options.avoidStartHour)
    : 13;
  const avoidEndHour = Number.isFinite(Number(options.avoidEndHour))
    ? Number(options.avoidEndHour)
    : 15;

  let remaining = Math.max(0, availableMinutes);
  const cursor = new Date();
  cursor.setHours(8, 0, 0, 0);
  const highFocusWindowEndHour = 13;

  for (const task of sorted) {
    if (remaining <= 0) break;
    if (task.duration > remaining) continue;

    // Predictive planning heuristic:
    // High-priority and difficult tasks are better in early energy window.
    const shouldFrontLoad =
      (task.priority === "High" || task.duration >= 60) && cursor.getHours() > highFocusWindowEndHour;
    if (shouldFrontLoad) {
      cursor.setHours(9, 0, 0, 0);
    }

    const start = new Date(cursor);
    if (start.getHours() >= avoidStartHour && start.getHours() < avoidEndHour) {
      cursor.setHours(avoidEndHour, 0, 0, 0);
    }
    cursor.setMinutes(cursor.getMinutes() + task.duration);
    const end = new Date(cursor);

    schedule.push({
      ...task,
      startTime: timeLabel(start),
      endTime: timeLabel(end),
      confidence: Math.max(
        50,
        100 -
          Math.max(0, task.duration - 90) / 2 -
          Math.max(0, (task.focusSessions || 0) * 2) +
          (task.priority === "High" ? 8 : 0)
      )
    });

    remaining -= task.duration;
    // Insert a short break between sessions.
    cursor.setMinutes(cursor.getMinutes() + breakMinutes);
  }

  return schedule;
}

// Upgrades overdue unfinished tasks to high priority and nudges due date to tomorrow.
export function smartRescheduleOverdue(tasks) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDue = tomorrow.toISOString();

  const updated = tasks.map((task) => {
    const due = parseDueDate(task);
    if (!task.completed && due && dayDiffFromToday(due) < 0) {
      return {
        ...task,
        priority: "High",
        dueDate: nextDue,
        wasAutoRescheduled: true
      };
    }
    return task;
  });

  const changed = updated.filter((t, i) => t !== tasks[i]).length;
  return { updated, changed };
}
