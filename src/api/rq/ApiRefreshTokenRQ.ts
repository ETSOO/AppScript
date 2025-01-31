import { TokenRQ } from "./TokenRQ";

/**
 * API Refresh Token Request data
 */
export type ApiRefreshTokenRQ = TokenRQ & {
  /**
   * Application ID, 0 for core system
   */
  appId: number;
};
