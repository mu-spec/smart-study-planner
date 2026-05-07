import React, { useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

const priorityColor = {
  High: colors.warning,
  Medium: "#CA8A04",
  Low: colors.success
};

function dueText(task) {
  if (!task.dueDate) return null;
  const due = new Date(task.dueDate);
  if (Number.isNaN(due.getTime())) return null;
  return `Due ${due.toDateString()}`;
}

export default function TaskCard({ task, onToggle, scheduled, onEdit, onDelete }) {
  const { themeMode } = useAppSettings();
  const styles = useMemo(() => createStyles(), [themeMode]);
  const due = dueText(task);
  const recurrenceLabel = task.recurrence && task.recurrence !== "None" ? task.recurrence : null;
  const hasAttachment = Boolean(task.attachmentUrl);
  const showActions = Boolean(onEdit || onDelete);

  const openAttachment = async () => {
    if (!hasAttachment) return;
    try {
      await Linking.openURL(task.attachmentUrl);
    } catch {
      // Keep no-op to avoid crashing in offline/invalid URL situations.
    }
  };

  return (
    <Pressable style={styles.card} onPress={() => onToggle?.(task.id)}>
      <View style={styles.row}>
        <View style={styles.subjectRow}>
          <Text style={styles.subject}>{task.subject}</Text>
          <View style={styles.iconTag}>
            <Text style={styles.iconTagText}>{task.icon || "Book"}</Text>
          </View>
        </View>
        <Text style={[styles.priority, { color: priorityColor[task.priority] || colors.muted }]}>
          {task.priority}
        </Text>
      </View>
      <Text style={[styles.name, task.completed && styles.completed]}>{task.name}</Text>
      <View style={styles.row}>
        <Text style={styles.meta}>{task.duration} mins</Text>
        {scheduled ? (
          <Text style={styles.meta}>
            {task.startTime} - {task.endTime}
          </Text>
        ) : (
          <Text style={styles.meta}>{task.completed ? "Completed" : "Pending"}</Text>
        )}
      </View>
      <View style={styles.row}>
        <Text style={styles.meta}>{due || "No due date"}</Text>
        <Text style={styles.meta}>Focus {task.focusMinutes || 0}m</Text>
      </View>
      {!!recurrenceLabel && <Text style={styles.smallTag}>Recurring: {recurrenceLabel}</Text>}
      {!!task.notes && <Text style={styles.notes}>{task.notes}</Text>}
      {hasAttachment && (
        <Pressable onPress={openAttachment}>
          <Text style={styles.link}>Open attachment</Text>
        </Pressable>
      )}
      {showActions && (
        <View style={styles.actionRow}>
          {onEdit && (
            <Pressable
              style={styles.iconBtn}
              onPress={() => onEdit?.(task)}
              accessibilityLabel="Edit task"
            >
              <Text style={styles.iconBtnText}>Edit</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable
              style={[styles.iconBtn, styles.iconBtnDanger]}
              onPress={() => onDelete?.(task)}
              accessibilityLabel="Delete task"
            >
              <Text style={[styles.iconBtnText, styles.iconBtnTextDanger]}>Del</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

const createStyles = () =>
  StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#0B1020",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 2
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  subject: {
    color: colors.primary,
    fontWeight: "700"
  },
  iconTag: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border
  },
  iconTagText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700"
  },
  name: {
    color: colors.text,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8
  },
  completed: {
    textDecorationLine: "line-through",
    color: colors.muted
  },
  priority: {
    fontWeight: "700"
  },
  meta: {
    color: colors.muted,
    fontSize: 12
  },
  smallTag: {
    marginTop: 6,
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700"
  },
  notes: {
    marginTop: 6,
    color: colors.text,
    fontSize: 12
  },
  link: {
    marginTop: 6,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end"
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 8
  },
  iconBtnDanger: {
    borderColor: colors.danger || "#DC2626"
  },
  iconBtnText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 11
  },
  iconBtnTextDanger: {
    color: colors.danger || "#DC2626"
  }
});
