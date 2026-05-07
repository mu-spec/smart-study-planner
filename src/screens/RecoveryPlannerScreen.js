import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import { useAppSettings } from "../context/AppSettingsContext";
import ScreenHeader from "../components/ScreenHeader";
import DecorativeBackground from "../components/DecorativeBackground";
import { buildRecoveryPlan } from "../services/recoveryService";
import colors from "../constants/colors";

export default function RecoveryPlannerScreen({ navigation }) {
  const { tasks } = useTasks();
  const { dailyGoalMinutes, themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);
  const plan = useMemo(() => buildRecoveryPlan(tasks, dailyGoalMinutes), [tasks, dailyGoalMinutes]);

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView contentContainerStyle={styles.wrap}>
        <ScreenHeader title="Recovery Plan" onBack={navigation?.goBack} />
        <View style={styles.card}>
          <Text style={styles.title}>Missed-Day Recovery</Text>
          <Text style={styles.meta}>Backlog: {plan.backlogMinutes}m</Text>
          <Text style={styles.meta}>Adaptive target: {plan.adaptiveTarget}m/day</Text>
          <Text style={styles.meta}>Remaining tasks after 5 days: {plan.remainingCount}</Text>
        </View>
        {plan.days.map((day) => (
          <View key={day.date} style={styles.card}>
            <Text style={styles.dayTitle}>{day.date} ({day.plannedMinutes}m)</Text>
            {day.items.length === 0 ? (
              <Text style={styles.meta}>Buffer day</Text>
            ) : (
              day.items.map((item) => (
                <Text key={`${day.date}-${item.id}`} style={styles.item}>
                  - {item.subject}: {item.name} ({item.duration}m)
                </Text>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
    wrap: { paddingBottom: 24 },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 12,
      marginBottom: 10
    },
    title: { color: colors.text, fontWeight: "800", fontSize: 18, marginBottom: 6 },
    dayTitle: { color: colors.text, fontWeight: "800", marginBottom: 4 },
    meta: { color: colors.muted, marginBottom: 3 },
    item: { color: colors.text, marginBottom: 2 }
  });
