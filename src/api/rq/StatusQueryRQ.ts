import { IdType } from "@etsoo/shared";
import { QueryRQ } from "./QueryRQ";
import { EntityStatus } from "../../business/EntityStatus";

/**
 * Query with status request data
 * com.etsoo.CoreFramework.Models.QueryRQ
 */
export type StatusQueryRQ<T extends IdType = number> = QueryRQ<T> & {
  /**
   * Enabled or not, null for all, true for enabled (<= EntityStatus.Approved), false for disabled (> 100)
   */
  enabled?: boolean;

  /**
   * Status
   */
  status?: EntityStatus;
};
