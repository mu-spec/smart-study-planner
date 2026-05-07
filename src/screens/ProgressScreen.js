import React, { useEffect, useRef, useMemo } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import ProgressChart from "../components/ProgressChart";
import ScreenHeader from "../components/ScreenHeader";
import { getStudyStreak, getSubjectAnalytics } from "../services/analyticsService";
import DecorativeBackground from "../components/DecorativeBackground";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ProgressScreen({ navigation }) {
  const { tasks } = useTasks();
  const { fontScale, highContrast, themeMode } = useAppSettings();
  const fade = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(), [themeMode, highContrast, fontScale]);
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const streak = getStudyStreak(tasks);
  const subjectStats = getSubjectAnalytics(tasks).slice(0, 4);
  const totalPlanned = tasks.reduce((sum, item) => sum + (item.duration || 0), 0);
  const totalFocus = tasks.reduce((sum, item) => sum + (item.focusMinutes || 0), 0);
  const utilization = totalPlanned ? Math.round((totalFocus / totalPlanned) * 100) : 0;
  const avgSession = tasks.length
    ? Math.round(tasks.reduce((sum, item) => sum + (item.focusSessions || 0), 0) / tasks.length)
    : 0;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true
    }).start();
  }, [fade]);

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader title="Progress" onBack={navigation?.goBack} />
        <Animated.View style={{ opacity: fade }}>
          <ProgressChart completed={completed} pending={pending} />
        </Animated.View>
        <Animated.View style={[styles.card, { opacity: fade }]}>
          <Text
            style={[
              styles.metricTitle,
              highContrast && styles.highContrastText,
              { fontSize: 16 * fontScale }
            ]}
          >
            Study Streak Focus
          </Text>
          <Text style={styles.metricText}>
            Current streak: {streak} day(s). Keep pending tasks under 3 for a balanced day.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fade }]}>
          <Text style={styles.metricTitle}>Subject Analytics</Text>
          {subjectStats.length === 0 ? (
            <Text style={styles.metricText}>No tasks yet. Add tasks to see subject insights.</Text>
          ) : (
            subjectStats.map((item) => {
              const pct = item.plannedMinutes
                ? Math.round((item.completedMinutes / item.plannedMinutes) * 100)
                : 0;
              return (
                <View key={item.subject} style={styles.subjectRow}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{item.subject}</Text>
                    <Text style={styles.subjectMeta}>{pct}% done</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%` }]} />
                  </View>
                  <Text style={styles.subjectMeta}>
                    Planned {item.plannedMinutes}m | Focus {item.focusMinutes}m
                  </Text>
                </View>
              );
            })
          )}
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fade }]}>
          <Text style={styles.metricTitle}>Time Usage & Focus Analytics</Text>
          <Text style={styles.metricText}>Planned minutes: {totalPlanned}</Text>
          <Text style={styles.metricText}>Focused minutes: {totalFocus}</Text>
          <Text style={styles.metricText}>Utilization: {utilization}%</Text>
          <Text style={styles.metricText}>Avg sessions/task: {avgSession}</Text>
        </Animated.View>
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
  scroll: {
    paddingBottom: 30
  },
  card: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  metricTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 6
  },
  metricText: {
    color: colors.muted
  },
  subjectRow: {
    marginTop: 10
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6
  },
  subjectName: {
    color: colors.text,
    fontWeight: "700"
  },
  subjectMeta: {
    color: colors.muted,
    fontSize: 12
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.bgSoft,
    overflow: "hidden",
    marginBottom: 4
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary
  },
  highContrastText: {
    color: "#FFFFFF",
    backgroundColor: "#000000",
    paddingHorizontal: 6,
    borderRadius: 4
  }
});
