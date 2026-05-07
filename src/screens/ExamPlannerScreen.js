import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import { generateExamPlan } from "../services/examPlannerService";
import DecorativeBackground from "../components/DecorativeBackground";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ExamPlannerScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const { tasks } = useTasks();
  const [examName, setExamName] = useState("Final Exam");
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 10);
  });
  const [dailyHours, setDailyHours] = useState("2");
  const [result, setResult] = useState(null);
  const styles = useMemo(() => createStyles(), [themeMode]);

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    return pending.reduce((sum, t) => sum + (t.duration || 0), 0);
  }, [tasks]);

  const handlePlan = () => {
    const parsedDate = new Date(`${examDate}T23:59:59`);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert("Invalid date", "Use format YYYY-MM-DD for exam date.");
      return;
    }
    const parsedHours = Number(dailyHours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
      Alert.alert("Invalid hours", "Daily study hours must be a positive number.");
      return;
    }
    const plan = generateExamPlan({
      examDate: parsedDate,
      tasks,
      dailyHours: parsedHours
    });
    setResult(plan);
  };

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <ScrollView contentContainerStyle={styles.wrap}>
        <ScreenHeader title="Exam Planner" onBack={navigation?.goBack} />
        <Text style={styles.title}>AI Exam Preparation Planner</Text>
        <Text style={styles.sub}>Pending syllabus load: {stats} minutes</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Exam Name</Text>
          <TextInput style={styles.input} value={examName} onChangeText={setExamName} />
          <Text style={styles.label}>Exam Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={examDate} onChangeText={setExamDate} />
          <Text style={styles.label}>Daily Study Hours</Text>
          <TextInput
            style={styles.input}
            value={dailyHours}
            keyboardType="numeric"
            onChangeText={setDailyHours}
          />
          <Pressable style={styles.btn} onPress={handlePlan}>
            <Text style={styles.btnText}>Generate Exam Plan</Text>
          </Pressable>
        </View>

        {result && (
          <View style={styles.card}>
            <Text style={styles.planTitle}>{examName}</Text>
            <Text style={styles.meta}>
              Days left: {result.daysLeft} | Required days: {result.requiredDays}
            </Text>
            {result.plan.map((day) => (
              <View key={day.date} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day.date}</Text>
                {day.items.length === 0 ? (
                  <Text style={styles.meta}>Buffer / revision day</Text>
                ) : (
                  day.items.map((task) => (
                    <Text key={`${day.date}-${task.id}`} style={styles.taskItem}>
                      - {task.subject}: {task.name} ({task.duration}m)
                    </Text>
                  ))
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 16, paddingBottom: 30 },
  title: { color: colors.text, fontWeight: "900", fontSize: 20 },
  sub: { color: colors.muted, marginBottom: 10 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12
  },
  label: { color: colors.text, fontWeight: "700", marginBottom: 4 },
  input: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 10
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 11
  },
  btnText: { color: "#FFFFFF", textAlign: "center", fontWeight: "800" },
  planTitle: { color: colors.text, fontWeight: "800", marginBottom: 4 },
  meta: { color: colors.muted, marginBottom: 6 },
  dayCard: {
    backgroundColor: colors.bgSoft,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8
  },
  dayTitle: { color: colors.text, fontWeight: "700", marginBottom: 4 },
  taskItem: { color: colors.text, marginBottom: 2 }
});
