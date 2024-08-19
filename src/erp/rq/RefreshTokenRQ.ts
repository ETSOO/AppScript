/**
 * Refresh token request data
 */
export type RefreshTokenRQ = {
    /**
     * Device id
     */
    deviceId: string;

    /**
     * Country or region
     */
    region: string;

    /**
     * Login password
     */
    pwd?: string;

    /**
     * Time zone
     */
    timezone?: string;
};
