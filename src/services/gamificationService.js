export function getXpSummary(tasks) {
  let xp = 0;
  let completedCount = 0;
  for (const task of tasks) {
    if (task.completed) {
      completedCount += 1;
      xp += 20 + Math.min(40, Math.round((task.duration || 0) / 2));
    }
    xp += Math.min(10, Math.floor((task.focusMinutes || 0) / 15));
  }

  const level = Math.max(1, Math.floor(xp / 120) + 1);
  const nextLevelXp = level * 120;
  const badges = getBadges(completedCount, xp, tasks);

  return { xp, level, nextLevelXp, badges };
}

function getBadges(completedCount, xp, tasks) {
  const badges = [];
  if (completedCount >= 5) badges.push("Starter Scholar");
  if (completedCount >= 20) badges.push("Consistency Champ");
  if (xp >= 300) badges.push("Deep Focus");
  if (tasks.some((task) => (task.focusMinutes || 0) >= 100)) badges.push("Marathon Mind");
  return badges;
}
