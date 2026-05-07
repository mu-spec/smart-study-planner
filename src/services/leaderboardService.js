export function getLocalLeaderboard(tasks, currentName = "You") {
  const completed = tasks.filter((t) => t.completed).length;
  const focus = tasks.reduce((sum, t) => sum + (t.focusMinutes || 0), 0);
  const streak = new Set(
    tasks.filter((t) => t.completedAt).map((t) => new Date(t.completedAt).toISOString().slice(0, 10))
  ).size;

  const base = [
    { name: "Ayesha", points: 960, streak: 11 },
    { name: "Hamza", points: 880, streak: 9 },
    { name: "Zainab", points: 820, streak: 7 }
  ];

  const myPoints = completed * 20 + focus + streak * 15;
  const merged = [...base, { name: currentName, points: myPoints, streak }];
  return merged.sort((a, b) => b.points - a.points).map((item, index) => ({ ...item, rank: index + 1 }));
}

