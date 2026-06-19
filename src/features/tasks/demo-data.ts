import type { Task, TaskPriority, TaskStatus } from "./schema";

const SEED: {
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
}[] = [
  {
    title: "Audit onboarding funnel",
    status: "backlog",
    priority: "medium",
    assignee: "Avery Quinn",
  },
  {
    title: "Draft Q3 roadmap",
    status: "backlog",
    priority: "low",
    assignee: "Jordan Lee",
  },
  {
    title: "Spike: usage-based billing",
    status: "backlog",
    priority: "high",
    assignee: "Priya Nair",
  },
  {
    title: "Fix avatar upload crop",
    status: "todo",
    priority: "high",
    assignee: "Mateo Rossi",
  },
  {
    title: "Add CSV export to reports",
    status: "todo",
    priority: "medium",
    assignee: "Hana Kim",
  },
  {
    title: "Rotate API signing keys",
    status: "todo",
    priority: "high",
    assignee: "Diego Alvarez",
  },
  {
    title: "Server-side pagination",
    status: "in_progress",
    priority: "medium",
    assignee: "Noa Cohen",
  },
  {
    title: "Refine empty states",
    status: "in_progress",
    priority: "low",
    assignee: "Sofia Marin",
  },
  {
    title: "Webhook retry backoff",
    status: "in_progress",
    priority: "high",
    assignee: "Kenji Tanaka",
  },
  {
    title: "Dark mode tokens",
    status: "done",
    priority: "low",
    assignee: "Amara Okafor",
  },
  {
    title: "Seed demo dataset",
    status: "done",
    priority: "medium",
    assignee: "Lucas Müller",
  },
  {
    title: "SSO enforcement",
    status: "done",
    priority: "high",
    assignee: "Yara Haddad",
  },
];

export const demoTasks: Task[] = SEED.map((task, i) => ({
  id: `task_${100 + i}`,
  ...task,
  createdAt: new Date(2026, 4, 1 + i),
  updatedAt: new Date(2026, 4, 2 + i),
}));
