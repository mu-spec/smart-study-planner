import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { applyTheme } from "../constants/colors";
import { scheduleDailyGoalReminder } from "../services/notificationService";

const SETTINGS_KEY = "@study_planner_settings";
const AppSettingsContext = createContext(null);

export function AppSettingsProvider({ children }) {
  const [themeMode, setThemeMode] = useState("light");
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [avatar, setAvatar] = useState("Bot");
  const [themePack, setThemePack] = useState("Classic");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(120);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const nextThemeMode =
          parsed.themeMode === "dark" || parsed.themeMode === "light" ? parsed.themeMode : "light";
        setThemeMode(nextThemeMode);
        const nextHighContrast = Boolean(parsed.highContrast);
        setHighContrast(nextHighContrast);
        if (Number(parsed.fontScale) >= 0.9 && Number(parsed.fontScale) <= 1.4) {
          setFontScale(Number(parsed.fontScale));
        }
        if (parsed.avatar) setAvatar(parsed.avatar);
        if (parsed.themePack) setThemePack(parsed.themePack);
        if (Number.isFinite(Number(parsed.dailyGoalMinutes))) {
          setDailyGoalMinutes(Number(parsed.dailyGoalMinutes));
        }
        applyTheme(nextThemeMode, parsed.themePack || "Classic", nextHighContrast);
      } else {
        applyTheme("light", "Classic", false);
      }

      scheduleDailyGoalReminder(
        Number.isFinite(Number(parsed?.dailyGoalMinutes)) ? Number(parsed.dailyGoalMinutes) : 120
      );
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    applyTheme(themeMode, themePack, highContrast);
  }, [themeMode, themePack, highContrast]);

  const persistSettings = async (next = {}) => {
    const settings = {
      themeMode: next.themeMode || themeMode,
      highContrast: typeof next.highContrast === "boolean" ? next.highContrast : highContrast,
      fontScale: next.fontScale || fontScale,
      avatar: next.avatar || avatar,
      themePack: next.themePack || themePack,
      dailyGoalMinutes:
        typeof next.dailyGoalMinutes === "number" ? next.dailyGoalMinutes : dailyGoalMinutes
    };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  };

  const toggleTheme = async () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    applyTheme(next, themePack, highContrast);
    await persistSettings({ themeMode: next });
  };

  const toggleHighContrast = async () => {
    const next = !highContrast;
    setHighContrast(next);
    applyTheme(themeMode, themePack, next);
    await persistSettings({ highContrast: next });
  };

  const updateFontScale = async (next) => {
    const safe = Math.max(0.9, Math.min(1.4, Number(next) || 1));
    setFontScale(safe);
    await persistSettings({ fontScale: safe });
  };

  const updateAvatar = async (next) => {
    setAvatar(next);
    await persistSettings({ avatar: next });
  };

  const updateThemePack = async (next) => {
    setThemePack(next);
    applyTheme(themeMode, next, highContrast);
    await persistSettings({ themePack: next });
  };

  const updateDailyGoalMinutes = async (next) => {
    const safe = Math.max(15, Math.min(480, Number(next) || 120));
    setDailyGoalMinutes(safe);
    await persistSettings({ dailyGoalMinutes: safe });
    scheduleDailyGoalReminder(safe);
  };

  const value = useMemo(
    () => ({
      themeMode,
      highContrast,
      fontScale,
      avatar,
      themePack,
      dailyGoalMinutes,
      loaded,
      toggleTheme,
      toggleHighContrast,
      updateFontScale,
      updateAvatar,
      updateThemePack,
      updateDailyGoalMinutes
    }),
    [themeMode, highContrast, fontScale, avatar, themePack, dailyGoalMinutes, loaded]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) throw new Error("useAppSettings must be used inside AppSettingsProvider");
  return context;
}
