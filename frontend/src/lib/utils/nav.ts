import type { NavigationItem } from "@/types";
import type { Dictionary } from "@/content/schema";

/** Replace each item's label with its localized value when a labelKey resolves. */
export function localizeNav(items: NavigationItem[], dict: Dictionary): NavigationItem[] {
  const labels = dict.common.nav as Record<string, string | undefined>;
  return items.map((item) => {
    const localized = item.labelKey ? labels[item.labelKey] : undefined;
    return {
      ...item,
      label: localized ?? item.label,
      children: item.children ? localizeNav(item.children, dict) : undefined,
    };
  });
}
