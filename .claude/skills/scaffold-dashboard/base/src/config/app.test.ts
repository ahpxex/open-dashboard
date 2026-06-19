import { describe, expect, it } from "vitest";
import type { MenuItem } from "@/lib/sidebar-items";
import { appConfig } from "./app";

function allItems(): MenuItem[] {
  return [
    ...appConfig.nav.main.flatMap((group) => group.items),
    ...appConfig.nav.bottom,
  ];
}

describe("appConfig", () => {
  it("has a non-empty brand name and description", () => {
    expect(appConfig.name.trim().length).toBeGreaterThan(0);
    expect(appConfig.description.trim().length).toBeGreaterThan(0);
  });

  it("exposes a renderable logo component", () => {
    // Phosphor icons are forwardRef render functions (objects) or functions.
    expect(["function", "object"]).toContain(typeof appConfig.logo);
  });

  it("uses a valid next-themes default", () => {
    expect(["light", "dark", "system"]).toContain(appConfig.theme.defaultTheme);
    expect(typeof appConfig.theme.enableSystem).toBe("boolean");
  });

  it("has at least a Dashboard nav entry", () => {
    const items = allItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item) => item.href === "/")).toBe(true);
  });

  it("every nav item has a label, an absolute href, and an icon", () => {
    for (const item of allItems()) {
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.href.startsWith("/")).toBe(true);
      expect(item.icon).toBeDefined();
    }
  });

  it("nav hrefs are unique (no duplicate destinations)", () => {
    const hrefs = allItems().map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
