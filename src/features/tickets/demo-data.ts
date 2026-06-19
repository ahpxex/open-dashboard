import type { Ticket, TicketPriority, TicketStatus } from "./schema";

const SEED: {
  subject: string;
  requester: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
}[] = [
  {
    subject: "Cannot log in after password reset",
    requester: "Avery Quinn",
    status: "open",
    priority: "urgent",
    assignee: "Sam Rivera",
  },
  {
    subject: "Billing charged twice this month",
    requester: "Jordan Lee",
    status: "open",
    priority: "high",
    assignee: "Sam Rivera",
  },
  {
    subject: "Export to CSV is missing columns",
    requester: "Priya Nair",
    status: "pending",
    priority: "medium",
    assignee: "Robin Park",
  },
  {
    subject: "Feature request: dark mode",
    requester: "Mateo Rossi",
    status: "open",
    priority: "low",
    assignee: "Robin Park",
  },
  {
    subject: "API rate limit too aggressive",
    requester: "Hana Kim",
    status: "pending",
    priority: "high",
    assignee: "Sam Rivera",
  },
  {
    subject: "Webhook deliveries delayed",
    requester: "Diego Alvarez",
    status: "open",
    priority: "high",
    assignee: "Robin Park",
  },
  {
    subject: "Onboarding email never arrived",
    requester: "Noa Cohen",
    status: "resolved",
    priority: "medium",
    assignee: "Sam Rivera",
  },
  {
    subject: "Dashboard chart renders blank",
    requester: "Sofia Marin",
    status: "pending",
    priority: "medium",
    assignee: "Robin Park",
  },
  {
    subject: "Need invoice for Q1",
    requester: "Kenji Tanaka",
    status: "resolved",
    priority: "low",
    assignee: "Sam Rivera",
  },
  {
    subject: "SSO login loop",
    requester: "Amara Okafor",
    status: "open",
    priority: "urgent",
    assignee: "Robin Park",
  },
  {
    subject: "Mobile layout overflow",
    requester: "Lucas Müller",
    status: "closed",
    priority: "low",
    assignee: "Sam Rivera",
  },
  {
    subject: "Cannot invite teammates",
    requester: "Yara Haddad",
    status: "pending",
    priority: "high",
    assignee: "Robin Park",
  },
  {
    subject: "Data import stuck at 90%",
    requester: "Elena Petrova",
    status: "open",
    priority: "medium",
    assignee: "Sam Rivera",
  },
  {
    subject: "Typo on pricing page",
    requester: "Tomas Novak",
    status: "resolved",
    priority: "low",
    assignee: "Robin Park",
  },
  {
    subject: "Refund not processed",
    requester: "Fatima Zahra",
    status: "closed",
    priority: "medium",
    assignee: "Sam Rivera",
  },
  {
    subject: "2FA codes rejected",
    requester: "Oliver Bennett",
    status: "open",
    priority: "urgent",
    assignee: "Robin Park",
  },
];

export const demoTickets: Ticket[] = SEED.map((row, i) => ({
  id: `tkt_${5000 + i}`,
  subject: row.subject,
  requester: row.requester,
  status: row.status,
  priority: row.priority,
  assignee: row.assignee,
  description: `${row.requester} reported: ${row.subject}. Investigating and following up.`,
  createdAt: new Date(2026, 5, 1 + i, 9 + (i % 8)),
  updatedAt: new Date(2026, 5, 2 + (i % 14), 10 + (i % 6)),
}));
