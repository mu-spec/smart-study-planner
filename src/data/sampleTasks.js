const sampleTasks = [
  {
    id: "1",
    subject: "Mathematics",
    name: "Practice algebra worksheet",
    duration: 60,
    priority: "High",
    completed: false,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    focusSessions: 0,
    focusMinutes: 0,
    recurrence: "Daily",
    icon: "Math",
    notes: "Focus on linear equations first.",
    attachmentUrl: "https://www.khanacademy.org/math/algebra"
  },
  {
    id: "2",
    subject: "Physics",
    name: "Read chapter on motion",
    duration: 45,
    priority: "Medium",
    completed: true,
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date().toISOString(),
    focusSessions: 1,
    focusMinutes: 25,
    recurrence: "None",
    icon: "Physics",
    notes: "",
    attachmentUrl: ""
  },
  {
    id: "3",
    subject: "Computer Science",
    name: "Revise sorting algorithms",
    duration: 50,
    priority: "High",
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    focusSessions: 0,
    focusMinutes: 0,
    recurrence: "Weekly",
    icon: "Code",
    notes: "Practice quick sort and merge sort comparison.",
    attachmentUrl: "https://www.geeksforgeeks.org/sorting-algorithms/"
  }
];

export default sampleTasks;

