import type { Score } from "./schema";

const STUDENTS = [
  "Mia Carter",
  "Leo Nguyen",
  "Zoe Adams",
  "Eli Brooks",
  "Aria Flores",
  "Owen Reed",
  "Nora Hughes",
  "Kai Morgan",
];

const ARTICLES = [
  "The Quick Brown Fox",
  "Common English Words",
  "Code Snippets Drill",
  "Speed Sprint 1",
  "Punctuation Practice",
];

export const demoScores: Score[] = Array.from({ length: 16 }, (_, i) => ({
  id: `scr_${15000 + i}`,
  student: STUDENTS[i % STUDENTS.length],
  article: ARTICLES[i % ARTICLES.length],
  wpm: 32 + ((i * 13) % 58),
  accuracy: 88 + ((i * 5) % 11),
  date: `2026-06-${String(1 + (i % 27)).padStart(2, "0")}`,
  createdAt: new Date(2026, 5, 1 + (i % 27)),
  updatedAt: new Date(2026, 5, 2 + (i % 27)),
}));
