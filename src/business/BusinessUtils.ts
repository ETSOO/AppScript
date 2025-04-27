import { ListType } from "@etsoo/shared";

/**
 * Business utils
 */
export namespace BusinessUtils {
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
}
