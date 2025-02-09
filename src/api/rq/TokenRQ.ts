/**
 * Token request data
 */
export type TokenInputRQ = {
  /**
   * Refresh token
   */
  token: string;
};

/**
 * Token request data
 */
export type TokenRQ = TokenInputRQ & {
  /**
   * Time zone
   */
  timeZone: string;
};
