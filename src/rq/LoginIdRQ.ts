/**
 * Login id request data
 */
export type LoginIdRQ = {
    /**
     * Device id
     */
    deviceId: string;

    /**
     * Username, Email or mobile
     */
    id: string;

    /**
     * Country or region
     */
    region: string;
};
