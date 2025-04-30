import { DataTypes, ListType } from "@etsoo/shared";
import { CustomCultureData } from "../def/CustomCulture";

/**
 * Business utils
 */
export namespace BusinessUtils {
  let resourcesCache: DataTypes.StringRecord = {};

  /**
   * Format avatar title
   * @param title Title
   * @param maxChars Max characters
   * @param defaultTitle Default title
   * @returns Result
   */
  export function formatAvatarTitle(
    title?: string,
    maxChars: number = 3,
    defaultTitle: string = "ME"
  ): string {
    // Just return for empty cases
    if (title == null || title === "") return defaultTitle;

    // split with words
    const items = title.trim().split(/\s+/g);

    if (items.length === 1) {
      // 2-3 Chinese names
      const titleLen = title.length;
      if (titleLen <= maxChars) return title.toUpperCase();

      // Return default for simplicity
      return defaultTitle;
    }

    // First letter of each item
    var firstLetters = items
      .map((item) => item[0])
      .join("")
      .toUpperCase();

    const flen = firstLetters.length;
    if (flen <= maxChars) return firstLetters;

    return defaultTitle;
  }

  /**
   * Get 12-month items
   * @param monthLabels Month labels
   * @param startMonth Start month, 0 as Jan.
   * @returns 12 months
   */
  export function getMonths(monthLabels: string[], startMonth: number = 0) {
    const months: ListType[] = [];

    for (let i = 0; i < 12; i++) {
      if (startMonth >= 12) startMonth = 0;

      months.push({ id: startMonth, label: monthLabels[startMonth] });

      startMonth++;
    }

    return months;
  }

  /**
   * Merge custom resources to target collection
   * @param target Target collection merges to
   * @param resources New resources to merge
   */
  export function mergeCustomResources(
    target: DataTypes.StringRecord,
    resources: CustomCultureData[]
  ) {
    for (const item of resources) {
      if (item.organizationId) {
        // Backup
        const backup = target[item.key];
        if (
          backup != null &&
          (typeof backup !== "object" || !("organizationId" in backup))
        ) {
          resourcesCache[item.key] = backup;
        }
      }

      if (item.description || item.jsonData) {
        const { key, ...rest } = item;
        target[key] = rest;
      } else {
        target[item.key] = item.title;
      }
    }
  }

  export function restoreResources(target?: DataTypes.StringRecord) {
    // Clear cache if no target
    if (target == null) {
      resourcesCache = {};
      return;
    }

    // Restore resources
    for (const key in resourcesCache) {
      target[key] = resourcesCache[key];
    }
  }
}
