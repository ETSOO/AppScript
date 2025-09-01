import { DataTypes, IdType, ListType } from "@etsoo/shared";
import { CustomCultureData } from "../def/CustomCulture";
import { QueryRQ } from "../api/rq/QueryRQ";

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
   * Format query, dealing with paging data
   * @param rq Query
   * @returns Result
   */
  export function formatQuery<T extends IdType>(rq: QueryRQ<T>) {
    let { queryPaging, ...rest } = rq;
    if (typeof queryPaging === "number") {
      queryPaging = { currentPage: 0, batchSize: queryPaging };
    }
    return { queryPaging, ...rest };
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
   * Check if the item is a custom culture data
   * @param item Item to check
   * @param hasOrgId Has orgId or not
   * @returns Result
   */
  export function isCustomCultureData(
    item: unknown,
    hasOrgId: boolean = false
  ): item is CustomCultureData {
    return (
      item != null &&
      typeof item === "object" &&
      "key" in item &&
      "title" in item &&
      (!hasOrgId || "orgId" in item)
    );
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
      if (item.orgId) {
        // Backup
        const backup = target[item.key];
        if (backup != null && !isCustomCultureData(backup, true)) {
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

  /**
   * Restore resources to target collection
   * @param target Target collection to restore resources to, null to clear cache
   */
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

  /**
   * Setup paging keysets
   * @param data Paging data
   * @param lastItem Last item of the query
   * @param idField Id field in data
   * @param fields Fields map
   */
  export function setupPagingKeysets<T, K extends IdType = number>(
    data: QueryRQ<K>,
    lastItem: T | undefined,
    idField: keyof T & string,
    fields?: Record<string, string | null | undefined>
  ) {
    // If the id field is not set for ordering, add it with descending
    if (typeof data.queryPaging === "object") {
      const orderBy = (data.queryPaging.orderBy ??= []);
      const idUpper = idField.toUpperCase();
      if (!orderBy.find((o) => o.field.toUpperCase() === idUpper)) {
        orderBy.push({ field: idField, desc: true, unique: true });
      }

      // Format order fields, like 'name' to 'Contact.Name' when 'Contact' is a reference table name in Entity Framework
      if (fields) {
        data.queryPaging.orderBy?.forEach((f) => {
          f.field = fields[f.field] ?? f.field;
        });
      }

      // Set the paging keysets
      if (lastItem) {
        const keysets = orderBy.map((o) => Reflect.get(lastItem, o.field));
        data.queryPaging.keysets = keysets;
      } else {
        data.queryPaging.keysets = undefined;
      }
    }

    return data;
  }
}
