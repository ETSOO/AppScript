/**
 * API refresh token data
 */
export type ApiRefreshTokenDto = {
  /**
   * Refresh token
   */
  readonly refreshToken: string;

  /**
   * Access token
   */
  readonly accessToken: string;

  /**
   * Token type
   */
  readonly tokenType: string;

  /**
   * Expires in
   */
  readonly expiresIn: number;
};
