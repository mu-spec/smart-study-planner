import AsyncStorage from "@react-native-async-storage/async-storage";

const EVENTS_KEY = "@study_planner_analytics_events";

async function getEvents() {
  const raw = await AsyncStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function logEvent(name, payload = {}) {
  const events = await getEvents();
  const next = [
    ...events.slice(-299),
    {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      payload,
      at: new Date().toISOString()
    }
  ];
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(next));
}

export async function getRecentEvents(limit = 30) {
  const events = await getEvents();
  return events.slice(-Math.max(1, limit)).reverse();
}
