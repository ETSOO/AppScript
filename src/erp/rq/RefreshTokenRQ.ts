/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
    /**
     * Device id
     */
    deviceId: string;

    /**
     * Login password
     */
    pwd?: string;

    /**
     * Time zone
     */
    timezone?: string;
};
