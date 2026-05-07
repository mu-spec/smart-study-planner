import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InterstitialAd, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { useTasks } from "../context/TaskContext";
import { generateDailySchedule } from "../services/schedulerService";
import { scheduleTaskReminders } from "../services/notificationService";
import { getStudyStreak } from "../services/analyticsService";
import { getSmartSuggestions } from "../services/suggestionService";
import { getInterstitialAdUnitId } from "../config/adConfig";
import { canShowAds, isExpoGo } from "../services/adService";
import {
  markInterstitialShown,
  registerScheduleGeneration,
  shouldShowInterstitialNow
} from "../services/adPacingService";
import TaskCard from "../components/TaskCard";
import PomodoroTimer from "../components/PomodoroTimer";
import DecorativeBackground from "../components/DecorativeBackground";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";
import { logEvent } from "../services/eventLogService";

const interstitialUnitId = getInterstitialAdUnitId() || TestIds.INTERSTITIAL;

export default function HomeScreen({ navigation }) {
  const { tasks, toggleTask, isOnline, addFocusSession, runSmartReschedule, updateTask, deleteTask } =
    useTasks();
  const { themeMode, toggleTheme, avatar, fontScale, dailyGoalMinutes } = useAppSettings();
  const [availableHours, setAvailableHours] = useState("4");
  const [schedule, setSchedule] = useState([]);
  const fade = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [taskSectionY, setTaskSectionY] = useState(0);
  const interstitialRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("today");
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    subject: "",
    name: "",
    duration: "",
    priority: "Medium",
    dueDate: "",
    notes: ""
  });
  const styles = useMemo(() => createStyles(), [themeMode]);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true
    }).start();
  }, [fade]);

  const topPendingTask = useMemo(() => tasks.find((task) => !task.completed) || null, [tasks]);
  const suggestions = useMemo(
    () => getSmartSuggestions(tasks, Number(availableHours) || 4),
    [tasks, availableHours]
  );

  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const streakTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const stamp = task.lastFocusAt || task.completedAt;
        return stamp && String(stamp).startsWith(todayKey);
      }),
    [tasks, todayKey]
  );
  const overdueTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (task.completed || !task.dueDate) return false;
        const due = new Date(task.dueDate);
        return !Number.isNaN(due.getTime()) && due < new Date();
      }),
    [tasks]
  );
  const filteredTasks = useMemo(() => {
    if (activeFilter === "pending") {
      return tasks.filter((task) => !task.completed);
    }
    if (activeFilter === "completed") {
      return tasks.filter((task) => task.completed);
    }
    if (activeFilter === "streak") {
      return streakTasks;
    }
    if (activeFilter === "overdue") {
      return overdueTasks;
    }
    return tasks;
  }, [activeFilter, tasks, streakTasks, overdueTasks]);

  const todaySummary = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.length - completed;
    const overdue = overdueTasks.length;
    const streak = getStudyStreak(tasks);
    return { completed, pending, overdue, streak };
  }, [tasks, overdueTasks]);

  const focusToday = useMemo(
    () =>
      tasks
        .filter((task) => {
          const stamp = task.lastFocusAt || task.completedAt;
          return stamp && String(stamp).startsWith(todayKey);
        })
        .reduce((sum, task) => sum + (task.focusMinutes || 0), 0),
    [tasks, todayKey]
  );
  const goalPct = Math.min(100, Math.round((focusToday / (dailyGoalMinutes || 1)) * 100));

  const scrollToTasks = () => {
    if (!scrollRef.current) return;
    const y = Math.max(taskSectionY - 12, 0);
    scrollRef.current.scrollTo({ y, animated: true });
  };

  const handleGenerateSchedule = async () => {
    const hours = Number(availableHours);
    const availableMinutes = Number.isFinite(hours) ? Math.max(1, hours) * 60 : 240;
    const planned = generateDailySchedule(tasks, availableMinutes, {
      breakMinutes: 10,
      avoidStartHour: 13,
      avoidEndHour: 15
    });
    setSchedule(planned);
    await scheduleTaskReminders(planned);
    logEvent("schedule_generated", { planned: planned.length, availableMinutes });
    AccessibilityInfo.announceForAccessibility("Schedule generated successfully");
    registerScheduleGeneration();

    if (canShowAds() && shouldShowInterstitialNow() && !isExpoGo()) {
      if (!interstitialRef.current) {
        interstitialRef.current = InterstitialAd.createForAdRequest(interstitialUnitId);
      }
      const interstitial = interstitialRef.current;
      const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
        markInterstitialShown();
        interstitial.show();
      });
      interstitial.load();
      setTimeout(() => unsubLoaded(), 5000);
    }

    Alert.alert("Schedule ready", `Planned ${planned.length} tasks with reminders.`);
  };

  const handlePomodoroComplete = (minutes) => {
    if (!topPendingTask) return;
    addFocusSession(topPendingTask.id, minutes);
    logEvent("pomodoro_completed", { minutes, taskId: topPendingTask.id });
    Alert.alert("Great focus", `${minutes} mins recorded on ${topPendingTask.subject}.`);
  };

  const handleSmartReschedule = () => {
    runSmartReschedule();
    logEvent("smart_reschedule_run");
    Alert.alert("Reschedule complete", "Overdue tasks were bumped to high priority.");
  };

  const openEdit = (task) => {
    const due = task.dueDate ? new Date(task.dueDate) : null;
    const dueInput =
      due && !Number.isNaN(due.getTime())
        ? `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(
            due.getDate()
          ).padStart(2, "0")}`
        : "";
    setEditingTask(task);
    setEditForm({
      subject: task.subject || "",
      name: task.name || "",
      duration: String(task.duration || ""),
      priority: task.priority || "Medium",
      dueDate: dueInput,
      notes: task.notes || ""
    });
  };

  const closeEdit = () => {
    setEditingTask(null);
  };

  const normalizeDueDate = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };


  const saveEdit = () => {
    if (!editingTask) return;
    const durationValue = Number(editForm.duration);
    const nextDue = normalizeDueDate(editForm.dueDate);
    updateTask(editingTask.id, {
      subject: editForm.subject.trim() || editingTask.subject,
      name: editForm.name.trim() || editingTask.name,
      duration: Number.isFinite(durationValue) ? durationValue : editingTask.duration,
      priority: editForm.priority || editingTask.priority,
      dueDate: nextDue,
      notes: editForm.notes
    });
    closeEdit();
  };

  const confirmDelete = (task) => {
    Alert.alert("Delete task?", "This will remove the task permanently.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(task.id) }
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      <DecorativeBackground />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <Animated.View
          style={[
            styles.headerCard,
            {
              opacity: fade,
              transform: [
                {
                  translateY: fade.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={styles.headerTopRow}>
            <Text style={[styles.headerTitle, { fontSize: 22 * fontScale }]}>AI Smart Study Planner</Text>
            <Pressable style={styles.themeBtn} onPress={toggleTheme}>
              <Text style={styles.themeBtnText}>{themeMode === "dark" ? "Light" : "Dark"}</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fade }}>
          <PomodoroTimer onSessionComplete={handlePomodoroComplete} />
        </Animated.View>

        <Animated.View style={[styles.quickRow, { opacity: fade }]}>
          <View style={styles.quickCard}>
            <Text style={styles.quickLabel}>Focus Target</Text>
            <Text style={styles.quickValue}>
              {topPendingTask ? `${topPendingTask.subject}: ${topPendingTask.name}` : "No pending task"}
            </Text>
          </View>
          <Pressable style={styles.quickAction} onPress={handleSmartReschedule}>
            <Text style={styles.quickActionText}>Smart Reschedule</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.statRow}>
          <Pressable
            style={[styles.statCard, activeFilter === "pending" && styles.statCardActive]}
            onPress={() => {
              setActiveFilter("pending");
              requestAnimationFrame(scrollToTasks);
            }}
          >
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{todaySummary.pending}</Text>
          </Pressable>
          <Pressable
            style={[styles.statCard, activeFilter === "completed" && styles.statCardActive]}
            onPress={() => {
              setActiveFilter("completed");
              requestAnimationFrame(scrollToTasks);
            }}
          >
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{todaySummary.completed}</Text>
          </Pressable>
          <Pressable
            style={[styles.statCard, activeFilter === "overdue" && styles.statCardActive]}
            onPress={() => {
              setActiveFilter("overdue");
              requestAnimationFrame(scrollToTasks);
            }}
          >
            <Text style={styles.statLabel}>Overdue</Text>
            <Text style={styles.statValue}>{todaySummary.overdue}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.statCard,
              styles.statCardLast,
              activeFilter === "streak" && styles.statCardActive
            ]}
            onPress={() => {
              setActiveFilter("streak");
              requestAnimationFrame(scrollToTasks);
            }}
          >
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{todaySummary.streak}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Daily Study Goal</Text>
          <Text style={styles.suggestionText}>
            {focusToday} / {dailyGoalMinutes} minutes ({goalPct}%)
          </Text>
          <View style={styles.goalTrack}>
            <View style={[styles.goalFill, { width: `${goalPct}%` }]} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>AI Study Recommendations</Text>
          {suggestions.map((suggestion) => (
            <Text key={suggestion} style={styles.suggestionText}>
              - {suggestion}
            </Text>
          ))}
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={availableHours}
            onChangeText={setAvailableHours}
            placeholder="Available hours today"
            placeholderTextColor={colors.muted}
          />
          <Pressable style={styles.primaryBtn} onPress={handleGenerateSchedule}>
            <Text style={styles.primaryBtnText}>Generate</Text>
          </Pressable>
        </View>

        <View style={styles.sectionRow} onLayout={(e) => setTaskSectionY(e.nativeEvent.layout.y)}>
          <Text style={styles.section}>
            {activeFilter === "pending"
              ? "Pending Tasks"
              : activeFilter === "completed"
              ? "Completed Tasks"
              : activeFilter === "overdue"
              ? "Overdue Tasks"
              : activeFilter === "streak"
              ? "Streak Tasks"
              : "All Tasks"}
          </Text>
          {activeFilter !== "today" && (
            <Pressable style={styles.resetBtn} onPress={() => setActiveFilter("today")}>
              <Text style={styles.resetBtnText}>All Today</Text>
            </Pressable>
          )}
        </View>
        {filteredTasks.length === 0 ? (
          <Text style={styles.empty}>
            {activeFilter === "completed"
              ? "No completed tasks."
              : activeFilter === "pending"
              ? "No pending tasks."
              : activeFilter === "overdue"
              ? "No overdue tasks."
              : activeFilter === "streak"
              ? "No streak tasks."
              : "No tasks found."}
          </Text>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={openEdit}
              onDelete={confirmDelete}
            />
          ))
        )}

        <Text style={[styles.section, styles.scheduleSection]}>AI Schedule</Text>
        {schedule.length === 0 ? (
          <Text style={styles.empty}>Generate to see today's optimized plan.</Text>
        ) : (
          schedule.map((item) => (
            <TaskCard
              key={`plan-${item.id}`}
              task={item}
              scheduled
              onEdit={openEdit}
              onDelete={confirmDelete}
            />
          ))
        )}
      </ScrollView>
      <Modal visible={Boolean(editingTask)} transparent animationType="fade" onRequestClose={closeEdit}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editForm.subject}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, subject: text }))}
              placeholder="Subject"
              placeholderTextColor={colors.muted}
            />
            <TextInput
              style={styles.modalInput}
              value={editForm.name}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
              placeholder="Task name"
              placeholderTextColor={colors.muted}
            />
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={editForm.duration}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, duration: text }))}
              placeholder="Duration (mins)"
              placeholderTextColor={colors.muted}
            />
            <TextInput
              style={styles.modalInput}
              value={editForm.priority}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, priority: text }))}
              placeholder="Priority (High, Medium, Low)"
              placeholderTextColor={colors.muted}
            />
            <View style={styles.priorityRow}>
              {["High", "Medium", "Low"].map((level) => (
                <Pressable
                  key={level}
                  style={[
                    styles.priorityChip,
                    editForm.priority === level && styles.priorityChipActive
                  ]}
                  onPress={() => setEditForm((prev) => ({ ...prev, priority: level }))}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      editForm.priority === level && styles.priorityChipTextActive
                    ]}
                  >
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.modalInput}
              value={editForm.dueDate}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, dueDate: text }))}
              placeholder="Due date (YYYY-MM-DD)"
              placeholderTextColor={colors.muted}
            />
            <Pressable
              style={styles.clearDueBtn}
              onPress={() => setEditForm((prev) => ({ ...prev, dueDate: "" }))}
            >
              <Text style={styles.clearDueText}>Clear due date</Text>
            </Pressable>
            <TextInput
              style={[styles.modalInput, styles.modalNotes]}
              value={editForm.notes}
              onChangeText={(text) => setEditForm((prev) => ({ ...prev, notes: text }))}
              placeholder="Notes"
              placeholderTextColor={colors.muted}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalBtn} onPress={closeEdit}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalPrimary]} onPress={saveEdit}>
                <Text style={[styles.modalBtnText, styles.modalPrimaryText]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = () =>
  StyleSheet.create({
  root: { flex: 1 },
  container: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8
  },
  headerCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14
  },
  headerTitle: {
    color: colors.text,
    fontWeight: "800",
    marginBottom: 6
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  themeBtn: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  themeBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  headerSub: {
    color: colors.muted
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12
  },
  suggestionText: {
    color: colors.text,
    marginBottom: 6
  },
  goalTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.bgSoft,
    overflow: "hidden"
  },
  goalFill: {
    height: 8,
    backgroundColor: colors.accent
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  quickRow: {
    marginBottom: 12
  },
  quickCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8
  },
  quickLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4
  },
  quickValue: {
    color: colors.text,
    fontWeight: "700"
  },
  quickAction: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 10
  },
  quickActionText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center"
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginRight: 6,
    alignItems: "center"
  },
  statCardLast: {
    marginRight: 0
  },
  statCardActive: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    marginBottom: 2
  },
  statValue: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginRight: 8
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "row",
    marginBottom: 16
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    marginRight: 8
  },
  secondaryBtnLast: {
    marginRight: 0
  },
  secondaryBtnText: {
    textAlign: "center",
    color: colors.text,
    fontWeight: "700"
  },
  section: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    marginTop: 8
  },
  scheduleSection: {
    marginTop: 4,
    marginBottom: 6
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  resetBtn: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  resetBtnText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  empty: {
    color: colors.muted
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 10
  },
  modalInput: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 8
  },
  modalNotes: {
    minHeight: 70,
    textAlignVertical: "top"
  },
  priorityRow: {
    flexDirection: "row",
    marginBottom: 8
  },
  priorityChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8
  },
  priorityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  priorityChipText: {
    textAlign: "center",
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  priorityChipTextActive: {
    color: "#FFFFFF"
  },
  clearDueBtn: {
    alignSelf: "flex-start",
    marginBottom: 8
  },
  clearDueText: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 8
  },
  modalBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    marginRight: 8
  },
  modalPrimary: {
    marginRight: 0,
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  modalBtnText: {
    textAlign: "center",
    color: colors.text,
    fontWeight: "700"
  },
  modalPrimaryText: {
    color: "#FFFFFF"
  }
});
