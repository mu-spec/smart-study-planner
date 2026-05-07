import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { useTasks } from "../context/TaskContext";
import DecorativeBackground from "../components/DecorativeBackground";
import ScreenHeader from "../components/ScreenHeader";
import { parseVoiceTaskTranscript } from "../services/voiceTaskParserService";
import colors from "../constants/colors";
import { useAppSettings } from "../context/AppSettingsContext";

const priorities = ["High", "Medium", "Low"];
const recurrenceOptions = ["None", "Daily", "Weekly"];
const taskIcons = ["Book", "Math", "Science", "Code", "Brain", "Notes"];

export default function AddTaskScreen({ navigation }) {
  const { themeMode } = useAppSettings();
  const { addTask } = useTasks();
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [dueInDays, setDueInDays] = useState("1");
  const [priority, setPriority] = useState("Medium");
  const [voiceText, setVoiceText] = useState("");
  const [recurrence, setRecurrence] = useState("None");
  const [icon, setIcon] = useState("Book");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [listening, setListening] = useState(false);

  const duePreview = useMemo(() => {
    const dayOffset = Number(dueInDays);
    if (!Number.isFinite(dayOffset) || dayOffset < 0) return "Invalid due day";
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toDateString();
  }, [dueInDays]);

  const styles = useMemo(() => createStyles(), [themeMode]);

  const handleSave = () => {
    if (!subject.trim() || !name.trim() || !duration.trim()) {
      Alert.alert("Missing fields", "Please fill all task fields.");
      return;
    }
    const numericDuration = Number(duration);
    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      Alert.alert("Invalid duration", "Duration must be a positive number in minutes.");
      return;
    }
    const numericDueInDays = Number(dueInDays);
    if (!Number.isFinite(numericDueInDays) || numericDueInDays < 0) {
      Alert.alert("Invalid due date", "Due days must be 0 or a positive number.");
      return;
    }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + numericDueInDays);
    dueDate.setHours(23, 59, 59, 999);

    addTask({
      subject: subject.trim(),
      name: name.trim(),
      duration: numericDuration,
      priority,
      dueDate: dueDate.toISOString(),
      recurrence,
      icon,
      notes: notes.trim(),
      attachmentUrl: attachmentUrl.trim()
    });
    navigation.goBack();
  };

  const applyVoiceInput = () => {
    const parsed = parseVoiceTaskTranscript(voiceText);
    if (!parsed) {
      Alert.alert("Voice input", "Type dictated text first, then tap Parse Voice.");
      return;
    }
    setSubject(parsed.subject);
    setName(parsed.name);
    setDuration(String(parsed.duration));
    setPriority(parsed.priority);
    if (parsed.subject.toLowerCase().includes("math")) setIcon("Math");
    if (parsed.subject.toLowerCase().includes("physics")) setIcon("Science");
    if (parsed.subject.toLowerCase().includes("computer")) setIcon("Code");
  };

  const startVoiceCapture = () => {
    const SpeechRecognition =
      global?.SpeechRecognition || global?.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      Alert.alert(
        "Voice capture",
        "Live speech capture is not available on this build. Use keyboard microphone and tap Parse Voice."
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setVoiceText(transcript);
      }
    };
    recognition.start();
  };

  return (
    <View style={styles.container}>
      <DecorativeBackground />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="Add Task" onBack={navigation?.goBack} />
          <View style={styles.card}>
            <Text style={styles.heading}>Create Study Task</Text>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Biology"
            />

            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Revise diagrams"
            />

            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              keyboardType="numeric"
              onChangeText={setDuration}
              placeholder="e.g. 45"
            />

            <Text style={styles.label}>Due in days</Text>
            <TextInput
              style={styles.input}
              value={dueInDays}
              keyboardType="numeric"
              onChangeText={setDueInDays}
              placeholder="e.g. 1"
            />
            <Text style={styles.preview}>Due date preview: {duePreview}</Text>

            <Text style={styles.label}>Voice Task Input (beta)</Text>
            <TextInput
              style={styles.input}
              value={voiceText}
              onChangeText={setVoiceText}
              placeholder="Dictate using keyboard mic: Math: revise integrals 45 mins high"
              multiline
            />
            <Pressable style={styles.voiceBtn} onPress={applyVoiceInput}>
              <Text style={styles.voiceBtnText}>Parse Voice</Text>
            </Pressable>
            <Pressable style={styles.voiceBtn} onPress={startVoiceCapture}>
              <Text style={styles.voiceBtnText}>
                {listening ? "Listening..." : "Start Voice Capture"}
              </Text>
            </Pressable>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {priorities.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.priorityPill, priority === item && styles.priorityPillActive]}
                  onPress={() => setPriority(item)}
                >
                  <Text style={[styles.priorityText, priority === item && styles.priorityTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Recurring</Text>
            <View style={styles.priorityRow}>
              {recurrenceOptions.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.priorityPill, recurrence === item && styles.priorityPillActive]}
                  onPress={() => setRecurrence(item)}
                >
                  <Text style={[styles.priorityText, recurrence === item && styles.priorityTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Task Icon</Text>
            <View style={styles.iconRow}>
              {taskIcons.map((item) => (
                <Pressable
                  key={item}
                  style={[styles.iconBtn, icon === item && styles.iconBtnActive]}
                  onPress={() => setIcon(item)}
                >
                  <Text style={styles.iconText}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional notes for this task"
              multiline
            />

            <Text style={styles.label}>Attachment Link (PDF/Website)</Text>
            <TextInput
              style={styles.input}
              value={attachmentUrl}
              onChangeText={setAttachmentUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Task</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bg
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 24
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14
  },
  heading: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 12
  },
  label: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14
  },
  preview: {
    color: colors.muted,
    marginTop: -8,
    marginBottom: 14
  },
  priorityRow: {
    flexDirection: "row",
    marginBottom: 14,
    flexWrap: "wrap"
  },
  priorityPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: colors.card
  },
  priorityPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  priorityText: {
    color: colors.text,
    fontWeight: "700"
  },
  priorityTextActive: {
    color: "#FFFFFF"
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14
  },
  saveBtnText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700"
  },
  voiceBtn: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 14
  },
  voiceBtnText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "700"
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 6
  },
  iconBtn: {
    minWidth: 60,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8
  },
  iconBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.card
  },
  iconText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top"
  }
});


