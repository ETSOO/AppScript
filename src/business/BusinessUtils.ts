import { ListType, ListType1 } from "@etsoo/shared";
import { CultureGridItem } from "./CultureItem";

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
   * Format cultures for data
   * @param cultures Supported cultures
   * @param data Data to format
   */
  export function formatCultues(
    cultures: ListType1[],
    data: { cultures?: CultureGridItem[] }
  ) {
    // Add the lost cultures
    const allCultures = data.cultures ?? [];
    cultures.forEach((culture) => {
      if (!allCultures.some((a) => a.id === culture.id)) {
        allCultures.push({ id: culture.id, title: "" });
      }
    });

    // Remove the default culture
    allCultures.remove((a) => a.id === cultures[0].id);
    // Sort
    allCultures.sortByProperty(
      "id",
      cultures.map((c) => c.id)
    );

    // Set back
    data.cultures = allCultures;
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
