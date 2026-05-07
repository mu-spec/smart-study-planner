import React, { useMemo } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import { getWeeklyReport } from "../services/reportService";
import { getXpSummary } from "../services/gamificationService";
import DecorativeBackground from "../components/DecorativeBackground";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { tasksToCSV, tasksToPrintableReport } from "../services/exportService";
import { tasksToICS } from "../services/calendarExportService";
import { logEvent } from "../services/eventLogService";
import { useAppSettings } from "../context/AppSettingsContext";

export default function WeeklyReportScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const { tasks } = useTasks();
  const report = getWeeklyReport(tasks);
  const xp = getXpSummary(tasks);
  const styles = useMemo(() => createStyles(), [themeMode]);

  const shareText = [
    `Weekly Report (${report.weekLabel})`,
    `Tasks added: ${report.tasksAdded}`,
    `Tasks completed: ${report.tasksCompleted}`,
    `Completion rate: ${report.completionRate}%`,
    `Focus minutes: ${report.focusMinutes}`,
    `XP: ${xp.xp}, Level: ${xp.level}`
  ].join("\n");

  const exportCsv = async () => {
    const csv = tasksToCSV(tasks);
    await Share.share({ message: csv, title: "study_tasks.csv" });
    logEvent("export_csv", { count: tasks.length });
  };

  const exportPdfStyle = async () => {
    const reportText = tasksToPrintableReport(tasks);
    await Share.share({ message: reportText, title: "study_report.pdf" });
    Alert.alert("Export prepared", "Shared as a printable report text. You can save as PDF from share target.");
    logEvent("export_report", { type: "printable" });
  };

  const exportCalendar = async () => {
    const ics = tasksToICS(tasks);
    await Share.share({ message: ics, title: "study_calendar.ics" });
    logEvent("export_calendar_ics", { count: tasks.length });
  };

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScreenHeader title="Weekly Report" onBack={navigation?.goBack} />
      <View style={styles.card}>
        <Text style={styles.title}>Weekly Study Report</Text>
        <Text style={styles.meta}>{report.weekLabel}</Text>
        <Text style={styles.line}>Tasks Added: {report.tasksAdded}</Text>
        <Text style={styles.line}>Tasks Completed: {report.tasksCompleted}</Text>
        <Text style={styles.line}>Completion Rate: {report.completionRate}%</Text>
        <Text style={styles.line}>Planned Minutes: {report.plannedMinutes}</Text>
        <Text style={styles.line}>Focus Minutes: {report.focusMinutes}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Gamification</Text>
        <Text style={styles.line}>XP: {xp.xp}</Text>
        <Text style={styles.line}>Level: {xp.level}</Text>
        <Text style={styles.line}>Next Level At: {xp.nextLevelXp} XP</Text>
        <Text style={styles.meta}>
          Badges: {xp.badges.length ? xp.badges.join(", ") : "No badges yet"}
        </Text>
      </View>

      <Pressable style={styles.shareBtn} onPress={exportCsv}>
        <Text style={styles.shareBtnText}>Export CSV</Text>
      </Pressable>
      <Pressable style={[styles.shareBtn, styles.secondary]} onPress={exportPdfStyle}>
        <Text style={styles.shareBtnText}>Export PDF Summary</Text>
      </Pressable>
      <Pressable style={[styles.shareBtn, styles.tertiary]} onPress={exportCalendar}>
        <Text style={styles.shareBtnText}>Export Calendar (.ics)</Text>
      </Pressable>
      <Text style={styles.preview}>{shareText}</Text>
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
    marginBottom: 6
  },
  line: {
    color: colors.text,
    marginBottom: 3
  },
  meta: {
    color: colors.muted
  },
  shareBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 8
  },
  shareBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center"
  },
  preview: {
    color: colors.muted,
    fontSize: 12
  },
  secondary: {
    backgroundColor: colors.primary
  },
  tertiary: {
    backgroundColor: colors.success
  }
});
