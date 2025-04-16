/**
 * Token authentication request data for API calls.
 */
export type TokenAuthRQ = {
  /**
   * The access token to be used for authentication.
   */
  accessToken: string;

  /**
   * The scheme of the token, e.g., "Bearer".
   */
  tokenScheme?: string;
};
