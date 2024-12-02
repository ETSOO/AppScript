export type ResetPasswordRQ = {
  /**
   * Email or mobile
   */
  id: string;

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
