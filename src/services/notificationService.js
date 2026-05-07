import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function requestNotificationPermissions() {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    await Notifications.requestPermissionsAsync();
  }
}

function nextDateForTimeLabel(label) {
  const [h, m] = label.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

// Clears old reminders and creates fresh reminders from generated schedule.
export async function scheduleTaskReminders(schedule) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const taskNotifications = scheduled.filter((item) =>
    String(item?.content?.title || "").startsWith("Study:")
  );
  await Promise.all(
    taskNotifications.map((item) =>
      item?.identifier ? Notifications.cancelScheduledNotificationAsync(item.identifier) : null
    )
  );
  for (const item of schedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Study: ${item.subject}`,
        body: `${item.name} (${item.startTime} - ${item.endTime})`
      },
      trigger: nextDateForTimeLabel(item.startTime)
    });
  }
}

export async function scheduleDailyGoalReminder(goalMinutes = 120) {
  if (!Number.isFinite(Number(goalMinutes)) || Number(goalMinutes) <= 0) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const goalNotifications = scheduled.filter(
    (item) => item?.content?.title === "Daily Study Goal"
  );
  await Promise.all(
    goalNotifications.map((item) =>
      item?.identifier ? Notifications.cancelScheduledNotificationAsync(item.identifier) : null
    )
  );
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Study Goal",
      body: `Aim for ${goalMinutes} minutes today. Open the planner to stay on track.`
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true
    }
  });
}
