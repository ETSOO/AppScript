export type ResetPasswordRQ = {
    /**
     * Email or mobile
     */
    id: string;

    /**
     * Verification code id
     */
    codeId: string;

    /**
     * Device id
     */
    deviceId: string;

    /**
     * New password
     */
    password: string;

    /**
     * Country or region
     */
    region: string;
};
