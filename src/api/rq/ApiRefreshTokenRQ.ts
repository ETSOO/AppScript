import { TokenInputRQ } from "./TokenRQ";

/**
 * API Refresh Token Request data
 */
export type ApiRefreshTokenRQ = TokenInputRQ & {
  /**
   * Application ID, 0 for core system
   */
  appId: number;
};
