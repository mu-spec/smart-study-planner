import React, { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useAppSettings } from "../context/AppSettingsContext";
import { useTasks } from "../context/TaskContext";
import DecorativeBackground from "../components/DecorativeBackground";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { getXpSummary } from "../services/gamificationService";
import { tasksToPrintableReport } from "../services/exportService";
import { getRecentEvents } from "../services/eventLogService";

const avatars = ["Bot", "Brain", "Rocket", "Book"];
const themePacks = ["Classic", "Ocean", "Forest"];
const APP_PACKAGE = "com.yourcompany.aismartstudyplanner";

export default function SettingsScreen({ navigation }) {
  const {
    themeMode,
    toggleTheme,
    highContrast,
    toggleHighContrast,
    fontScale,
    updateFontScale,
    avatar,
    updateAvatar,
    themePack,
    updateThemePack,
    dailyGoalMinutes,
    updateDailyGoalMinutes
  } = useAppSettings();
  const { tasks } = useTasks();
  const [email, setEmail] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const xp = getXpSummary(tasks);
  const unlockedThemePacks = xp.level >= 3 ? themePacks : ["Classic"];
  const styles = useMemo(() => createStyles(), [themeMode]);

  useEffect(() => {
    setEmail("Guest mode");
    getRecentEvents(8).then(setRecentEvents);
  }, []);

  const handleExportReport = async () => {
    const text = tasksToPrintableReport(tasks);
    await Share.share({ message: text });
  };

  const openUrl = async (url) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleRateApp = async () => {
    const playStoreAppUrl = `market://details?id=${APP_PACKAGE}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${APP_PACKAGE}`;
    try {
      await openUrl(playStoreAppUrl);
    } catch {
      await openUrl(webUrl);
    }
  };

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView contentContainerStyle={styles.wrap}>
        <ScreenHeader title="Settings" onBack={navigation?.goBack} />
        <View style={styles.card}>
          <Text style={styles.title}>Export & Backup</Text>
          <Text style={styles.meta}>Export a report you can save or share.</Text>
          <Pressable style={styles.btn} onPress={handleExportReport}>
            <Text style={styles.btnText}>Export Report</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.rateBtn]} onPress={handleRateApp}>
            <Text style={styles.btnText}>Rate App</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Daily Study Goal</Text>
          <Text style={styles.line}>Goal: {dailyGoalMinutes} minutes</Text>
          <View style={styles.row}>
            <Pressable
              style={styles.smallBtn}
              onPress={() => updateDailyGoalMinutes(dailyGoalMinutes - 15)}
            >
              <Text style={styles.smallBtnText}>-15</Text>
            </Pressable>
            <Pressable
              style={styles.smallBtn}
              onPress={() => updateDailyGoalMinutes(dailyGoalMinutes + 15)}
            >
              <Text style={styles.smallBtnText}>+15</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => updateDailyGoalMinutes(120)}>
              <Text style={styles.smallBtnText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Accessibility</Text>
          <Text style={styles.line}>Theme: {themeMode}</Text>
          <Text style={styles.line}>High contrast: {highContrast ? "On" : "Off"}</Text>
          <Text style={styles.line}>Text size: {Math.round(fontScale * 100)}%</Text>
          <View style={styles.row}>
            <Pressable style={styles.smallBtn} onPress={toggleTheme}>
              <Text style={styles.smallBtnText}>Dark Mode</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={toggleHighContrast}>
              <Text style={styles.smallBtnText}>Contrast</Text>
            </Pressable>
            <Pressable style={styles.smallBtn} onPress={() => updateFontScale(fontScale + 0.1)}>
              <Text style={styles.smallBtnText}>A+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Avatar & Themes</Text>
          <Text style={styles.meta}>Level {xp.level} unlocks more theme packs.</Text>
          <Text style={styles.line}>Current avatar: {avatar}</Text>
          <View style={styles.row}>
            {avatars.map((item) => (
              <Pressable key={item} style={styles.avatarBtn} onPress={() => updateAvatar(item)}>
                <Text style={styles.avatarText}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.line}>Theme pack: {themePack}</Text>
          <View style={styles.row}>
            {unlockedThemePacks.map((item) => (
              <Pressable key={item} style={styles.smallBtn} onPress={() => updateThemePack(item)}>
                <Text style={styles.smallBtnText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Home screen widget section removed. */}
        <View style={styles.card}>
          <Text style={styles.title}>Diagnostics</Text>
          <Text style={styles.meta}>Recent app events and crash logs</Text>
          {recentEvents.length === 0 ? (
            <Text style={styles.line}>No events captured yet.</Text>
          ) : (
            recentEvents.map((item) => (
              <Text key={item.id} style={styles.line}>
                {item.name} ({new Date(item.at).toLocaleTimeString()})
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16
  },
  wrap: {
    paddingBottom: 30
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 4
  },
  meta: {
    color: colors.muted,
    marginBottom: 8
  },
  line: {
    color: colors.text,
    marginBottom: 8
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 8
  },
  rateBtn: {
    backgroundColor: colors.success
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center"
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  smallBtn: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  },
  smallBtnText: {
    color: colors.text,
    fontWeight: "700"
  },
  avatarBtn: {
    minWidth: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgSoft
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text
  }
});
