import { IdType } from "@etsoo/shared";
import { QueryRQ } from "./QueryRQ";
import { EntityStatus } from "../../business/EntityStatus";

/**
 * Query with status request data
 * com.etsoo.CoreFramework.Models.QueryRQ
 */
export type StatusQueryRQ<T extends IdType = number> = QueryRQ<T> & {
  /**
   * Disabled or not, null for all, true for disabled (> EntityStatus.Approved), false for enabled (<= 100)
   */
  disabled?: boolean;

  /**
   * Status
   */
  status?: EntityStatus;
};