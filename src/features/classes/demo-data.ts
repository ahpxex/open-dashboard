import type { ClassGroup, ClassLevel } from "./schema";

const SEED: {
  name: string;
  teacher: string;
  studentCount: number;
  level: ClassLevel;
}[] = [
  {
    name: "Grade 5 — Morning",
    teacher: "Ms. Stone",
    studentCount: 28,
    level: "beginner",
  },
  {
    name: "Grade 5 — Afternoon",
    teacher: "Ms. Stone",
    studentCount: 26,
    level: "beginner",
  },
  {
    name: "Grade 6 — A",
    teacher: "Mr. Patel",
    studentCount: 30,
    level: "intermediate",
  },
  {
    name: "Grade 6 — B",
    teacher: "Mr. Patel",
    studentCount: 27,
    level: "intermediate",
  },
  {
    name: "Speed Club",
    teacher: "Ms. Romero",
    studentCount: 18,
    level: "advanced",
  },
  {
    name: "Accuracy Lab",
    teacher: "Ms. Romero",
    studentCount: 15,
    level: "advanced",
  },
  {
    name: "After-school Beginners",
    teacher: "Mr. Lee",
    studentCount: 22,
    level: "beginner",
  },
  {
    name: "Exam Prep",
    teacher: "Mr. Lee",
    studentCount: 19,
    level: "intermediate",
  },
];

export const demoClasses: ClassGroup[] = SEED.map((row, i) => ({
  id: `cls_${13000 + i}`,
  name: row.name,
  teacher: row.teacher,
  studentCount: row.studentCount,
  level: row.level,
  createdAt: new Date(2025, 8, 1 + i),
  updatedAt: new Date(2026, 4, 1 + i),
}));
