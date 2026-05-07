import React, { useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useTasks } from "../context/TaskContext";
import DecorativeBackground from "../components/DecorativeBackground";
import TaskCard from "../components/TaskCard";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

function dateKey(d) {
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function nextDays(count = 14) {
  const dates = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function CalendarScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const { tasks, toggleTask, updateTask, deleteTask } = useTasks();
  const days = useMemo(() => nextDays(14), []);
  const [selected, setSelected] = useState(dateKey(new Date()) || "");
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

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.dueDate && dateKey(task.dueDate) && dateKey(task.dueDate) === selected),
    [tasks, selected]
  );

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
    <View style={styles.container}>
      <DecorativeBackground />
      <ScreenHeader title="Calendar" onBack={navigation?.goBack} />
      <ScrollView
        contentContainerStyle={styles.taskWrap}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stickyHeader}>
          <Text style={styles.title}>Calendar View</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
            {days.map((day) => {
              const key = dateKey(day);
              const active = key === selected;
              if (!key) return null;
              return (
                <Pressable
                  key={key}
                  onPress={() => setSelected(key)}
                  style={[styles.dayChip, active && styles.dayChipActive]}
                >
                  <Text style={[styles.dayText, active && styles.dayTextActive]}>
                    {day.toDateString().slice(0, 10)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {selectedTasks.length === 0 ? (
          <Text style={styles.empty}>No tasks due on selected day.</Text>
        ) : (
          selectedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
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
  stickyHeader: {
    backgroundColor: colors.bg,
    paddingTop: 4,
    paddingBottom: 6,
    zIndex: 2,
    shadowColor: "#0B1020",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginBottom: 10
  },
  dayRow: {
    maxHeight: 46,
    marginBottom: 10
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: colors.card
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dayText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  dayTextActive: {
    color: "#FFFFFF"
  },
  taskWrap: {
    paddingTop: 0,
    paddingBottom: 30
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
