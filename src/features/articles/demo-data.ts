import type { Article, ArticleDifficulty, ArticleStatus } from "./schema";

const SEED: {
  title: string;
  author: string;
  wordCount: number;
  difficulty: ArticleDifficulty;
  status: ArticleStatus;
}[] = [
  {
    title: "The Quick Brown Fox",
    author: "Editorial",
    wordCount: 120,
    difficulty: "easy",
    status: "published",
  },
  {
    title: "Home Row Basics",
    author: "Editorial",
    wordCount: 90,
    difficulty: "easy",
    status: "published",
  },
  {
    title: "Common English Words",
    author: "M. Stone",
    wordCount: 240,
    difficulty: "easy",
    status: "published",
  },
  {
    title: "Punctuation Practice",
    author: "M. Stone",
    wordCount: 180,
    difficulty: "medium",
    status: "published",
  },
  {
    title: "Numbers & Symbols",
    author: "A. Patel",
    wordCount: 150,
    difficulty: "medium",
    status: "published",
  },
  {
    title: "Code Snippets Drill",
    author: "A. Patel",
    wordCount: 320,
    difficulty: "hard",
    status: "published",
  },
  {
    title: "Shakespeare Excerpts",
    author: "Editorial",
    wordCount: 410,
    difficulty: "hard",
    status: "draft",
  },
  {
    title: "Business Email Phrases",
    author: "L. Romero",
    wordCount: 260,
    difficulty: "medium",
    status: "published",
  },
  {
    title: "Speed Sprint 1",
    author: "Editorial",
    wordCount: 60,
    difficulty: "easy",
    status: "published",
  },
  {
    title: "Accuracy Marathon",
    author: "L. Romero",
    wordCount: 520,
    difficulty: "hard",
    status: "draft",
  },
  {
    title: "Capital Cities",
    author: "A. Patel",
    wordCount: 200,
    difficulty: "medium",
    status: "archived",
  },
  {
    title: "Legal Terms",
    author: "M. Stone",
    wordCount: 380,
    difficulty: "hard",
    status: "archived",
  },
];

export const demoArticles: Article[] = SEED.map((row, i) => ({
  id: `art_${12000 + i}`,
  title: row.title,
  author: row.author,
  wordCount: row.wordCount,
  difficulty: row.difficulty,
  status: row.status,
  createdAt: new Date(2026, 0, 1 + i * 7),
  updatedAt: new Date(2026, 4, 1 + i),
}));
