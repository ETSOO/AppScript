import { IApiPayload } from "@etsoo/restclient";

/**
 * Audit line data
 */
export type AuditLineDto = {
  id: number;
  creation: Date;
  user: string;
  action: string;
  changes?: AuditLineChangesDto;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
};

/**
 * Audit line changes data
 */
export type AuditLineChangesDto = {
  oldData: Record<string, unknown>;
  newData: Record<string, unknown>;
};

/**
 * Audit line API payload
 */
export type AuditLinePayload = IApiPayload<AuditLineDto[]>;
