import type { Icon } from "@phosphor-icons/react";

import {
  AddressBookIcon,
  ArrowsClockwiseIcon,
  ArticleIcon,
  BellIcon,
  BuildingsIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  CpuIcon,
  FileTextIcon,
  GaugeIcon,
  GearIcon,
  GraduationCapIcon,
  HandshakeIcon,
  HeadsetIcon,
  HouseIcon,
  IdentificationCardIcon,
  KanbanIcon,
  PackageIcon,
  ReceiptIcon,
  SlidersHorizontalIcon,
  SquaresFourIcon,
  StackIcon,
  TicketIcon,
  TrayIcon,
  TreeStructureIcon,
  TrophyIcon,
  UserPlusIcon,
  UsersIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

export interface MenuItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface MenuGroup {
  groupLabel?: string;
  items: MenuItem[];
}

/**
 * The sidebar is organised by **business scenario** — each group is a complete
 * back-office for a believable product, composing the gallery UI shapes into a
 * real vertical. The `Gallery` group at the bottom is the single entry point to
 * the UI-shape palette (every individual shape demo lives under `/gallery/*`
 * but is reached from the Overview, not listed here).
 *
 * New scenario groups are inserted above the `gallery:anchor` line as each is
 * built. Generated CRUD resources land at the `create-resource:anchor`.
 */
export const mainMenuItems: MenuGroup[] = [
  {
    groupLabel: "taoracle",
    items: [
      { label: "Overview", href: "/", icon: HouseIcon },
      { label: "Tasks", href: "/taoracle/tasks", icon: KanbanIcon },
      { label: "Users", href: "/taoracle/users", icon: UsersIcon },
      {
        label: "Affiliate & codes",
        href: "/taoracle/affiliate",
        icon: TicketIcon,
      },
      { label: "Blog", href: "/posts", icon: FileTextIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
  {
    groupLabel: "E-commerce",
    items: [
      { label: "Products", href: "/products", icon: PackageIcon },
      { label: "Orders", href: "/orders", icon: ReceiptIcon },
      { label: "Customers", href: "/customers", icon: AddressBookIcon },
      { label: "Refunds", href: "/refunds", icon: ArrowsClockwiseIcon },
    ],
  },
  {
    groupLabel: "Helpdesk",
    items: [
      { label: "Overview", href: "/helpdesk", icon: HeadsetIcon },
      { label: "Inbox", href: "/helpdesk/tickets", icon: TrayIcon },
      { label: "Triage board", href: "/helpdesk/board", icon: KanbanIcon },
    ],
  },
  {
    groupLabel: "Sales (CRM)",
    items: [
      { label: "Forecast", href: "/crm", icon: ChartLineUpIcon },
      { label: "Pipeline", href: "/crm/deals", icon: HandshakeIcon },
      {
        label: "Contacts",
        href: "/crm/contacts",
        icon: IdentificationCardIcon,
      },
      { label: "Companies", href: "/crm/companies", icon: BuildingsIcon },
    ],
  },
  {
    groupLabel: "People (HR)",
    items: [
      { label: "Org chart", href: "/hr/org", icon: TreeStructureIcon },
      { label: "Directory", href: "/hr/directory", icon: UsersThreeIcon },
      { label: "Time off", href: "/hr/leave", icon: CalendarBlankIcon },
      { label: "Onboarding", href: "/hr/onboarding", icon: UserPlusIcon },
    ],
  },
  {
    groupLabel: "Fleet (IoT)",
    items: [
      { label: "Overview", href: "/fleet", icon: GaugeIcon },
      { label: "Devices", href: "/fleet/devices", icon: CpuIcon },
      { label: "Alerts", href: "/fleet/alerts", icon: BellIcon },
      {
        label: "Settings",
        href: "/fleet/settings",
        icon: SlidersHorizontalIcon,
      },
    ],
  },
  {
    groupLabel: "Typing platform",
    items: [
      { label: "Articles", href: "/typing/articles", icon: ArticleIcon },
      { label: "Students", href: "/typing/students", icon: GraduationCapIcon },
      { label: "Scores", href: "/typing/scores", icon: TrophyIcon },
      { label: "Classes", href: "/typing/classes", icon: StackIcon },
    ],
  },
  // gallery:anchor (keep this line — new scenario groups go above; Gallery stays last)
  {
    groupLabel: "Gallery",
    items: [{ label: "Overview", href: "/gallery", icon: SquaresFourIcon }],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
