import type { Student } from "./schema";

const NAMES = [
  "Mia Carter",
  "Leo Nguyen",
  "Zoe Adams",
  "Eli Brooks",
  "Aria Flores",
  "Owen Reed",
  "Nora Hughes",
  "Kai Morgan",
  "Lily Foster",
  "Max Bennett",
  "Ivy Coleman",
  "Sam Ortiz",
  "Ruby Hayes",
  "Finn Walsh",
];

const CLASSES = [
  "Grade 5 — Morning",
  "Grade 6 — A",
  "Speed Club",
  "Grade 6 — B",
];

export const demoStudents: Student[] = NAMES.map((name, i) => ({
  id: `stu_${14000 + i}`,
  name,
  className: CLASSES[i % CLASSES.length],
  wpm: 28 + ((i * 11) % 55),
  accuracy: 86 + ((i * 3) % 13),
  lessonsDone: 12 + ((i * 7) % 80),
  createdAt: new Date(2025, 9, 1 + i * 2),
  updatedAt: new Date(2026, 4, 1 + i),
}));
