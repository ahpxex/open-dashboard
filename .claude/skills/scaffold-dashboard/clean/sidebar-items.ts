import type { Icon } from "@phosphor-icons/react";

import { GearIcon, HouseIcon } from "@phosphor-icons/react";

export interface MenuItem {
  label: string;
  href: string;
  icon: Icon;
}

export interface MenuGroup {
  groupLabel?: string;
  items: MenuItem[];
}

export const mainMenuItems: MenuGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: HouseIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
