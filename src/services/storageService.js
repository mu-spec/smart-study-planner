import AsyncStorage from "@react-native-async-storage/async-storage";
import sampleTasks from "../data/sampleTasks";

const TASKS_KEY = "@study_planner_tasks";

function normalizeTask(task) {
  return {
    ...task,
    createdAt: task.createdAt || new Date().toISOString(),
    completedAt: task.completed ? task.completedAt || new Date().toISOString() : null,
    focusSessions: task.focusSessions || 0,
    focusMinutes: task.focusMinutes || 0,
    lastFocusAt: task.lastFocusAt || null,
    wasAutoRescheduled: Boolean(task.wasAutoRescheduled),
    recurrence: task.recurrence || "None",
    icon: task.icon || "Book",
    notes: task.notes || "",
    attachmentUrl: task.attachmentUrl || "",
    sharedWith: Array.isArray(task.sharedWith) ? task.sharedWith : []
  };
}

export async function getStoredTasks() {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  if (!raw) {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(sampleTasks));
    return sampleTasks.map(normalizeTask);
  }
  return JSON.parse(raw).map(normalizeTask);
}

export async function saveTasks(tasks) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

