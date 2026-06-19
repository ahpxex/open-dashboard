import type { Icon } from "@phosphor-icons/react";

import {
  FileTextIcon,
  GearIcon,
  HouseIcon,
  PackageIcon,
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

export const mainMenuItems: MenuGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: HouseIcon },
      { label: "Products", href: "/products", icon: PackageIcon },
      { label: "Orders", href: "/orders", icon: PackageIcon },
      { label: "Posts", href: "/posts", icon: FileTextIcon },
      // create-resource:anchor (keep this line — generated resources are inserted above)
    ],
  },
];

export const bottomMenuItems: MenuItem[] = [
  { label: "Settings", href: "/settings", icon: GearIcon },
];
