/**
 * Signout request data
 */
export type SignoutRQ = {
    /**
     * Device id
     */
    readonly deviceId: string;

    /**
     * Refresh token
     */
    readonly token: string;
};
