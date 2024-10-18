/**
 * API Refresh Token Request data
 */
export type ApiRefreshTokenRQ = {
    /**
     * Refresh token
     */
    token: string;

    /**
     * Application ID, 0 for core system
     */
    appId?: number;
};
