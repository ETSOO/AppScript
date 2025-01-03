/**
 * Switch organization request data
 */
export type SwitchOrgRQ = {
  /**
   * Target organization id
   */
  organizationId: number;

  /**
   * From organization id
   */
  fromOrganizationId?: number;

  /**
   * Core system access token
   */
  token: string;
};
