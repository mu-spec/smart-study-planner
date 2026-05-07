import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getStoredTasks, saveTasks } from "../services/storageService";
import { smartRescheduleOverdue } from "../services/schedulerService";

const TaskContext = createContext(null);

function nextRecurringDueDate(currentDueDate, recurrence = "None") {
  const base = currentDueDate ? new Date(currentDueDate) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  if (recurrence === "Daily") {
    base.setDate(base.getDate() + 1);
    return base.toISOString();
  }
  if (recurrence === "Weekly") {
    base.setDate(base.getDate() + 7);
    return base.toISOString();
  }
  return null;
}

function createTask(task) {
  return {
    ...task,
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    completed: false,
    createdAt: new Date().toISOString(),
    completedAt: null,
    focusSessions: 0,
    focusMinutes: 0,
    lastFocusAt: null,
    wasAutoRescheduled: false,
    recurrence: task.recurrence || "None",
    icon: task.icon || "Book",
    notes: task.notes || "",
    attachmentUrl: task.attachmentUrl || "",
    sharedWith: task.sharedWith || []
  };
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    (async () => {
      const local = await getStoredTasks();
      setTasks(local);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;
    saveTasks(tasks);
  }, [tasks, loading, isOnline]);

  const addTask = (task) => {
    setTasks((prev) => [...prev, createTask(task)]);
  };

  const toggleTask = (id) => {
    setTasks((prev) => {
      const toggled = prev.map((task) => {
        if (task.id !== id) return task;
        const completed = !task.completed;
        return {
          ...task,
          completed,
          completedAt: completed ? new Date().toISOString() : null
        };
      });

      const justCompleted = toggled.find((task) => task.id === id && task.completed);
      if (!justCompleted || !["Daily", "Weekly"].includes(justCompleted.recurrence)) {
        return toggled;
      }

      const nextDueDate = nextRecurringDueDate(justCompleted.dueDate, justCompleted.recurrence);
      const alreadyQueued = toggled.some(
        (task) =>
          !task.completed &&
          task.name === justCompleted.name &&
          task.subject === justCompleted.subject &&
          task.recurrence === justCompleted.recurrence &&
          task.dueDate === nextDueDate
      );

      if (alreadyQueued || !nextDueDate) return toggled;

      return [
        ...toggled,
        createTask({
          subject: justCompleted.subject,
          name: justCompleted.name,
          duration: justCompleted.duration,
          priority: justCompleted.priority,
          dueDate: nextDueDate,
          recurrence: justCompleted.recurrence,
          icon: justCompleted.icon,
          notes: justCompleted.notes,
          attachmentUrl: justCompleted.attachmentUrl
        })
      ];
    });
  };

  const addFocusSession = (id, minutes = 25) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              focusSessions: (task.focusSessions || 0) + 1,
              focusMinutes: (task.focusMinutes || 0) + minutes,
              lastFocusAt: new Date().toISOString()
            }
          : task
      )
    );
  };

  const runSmartReschedule = () => {
    setTasks((prev) => smartRescheduleOverdue(prev).updated);
  };

  const updateTask = (id, updates) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const value = useMemo(
    () => ({
      tasks,
      loading,
      isOnline,
      addTask,
      toggleTask,
      addFocusSession,
      runSmartReschedule,
      updateTask,
      deleteTask
    }),
    [tasks, loading, isOnline]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used inside TaskProvider");
  return ctx;
}
