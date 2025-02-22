/**
 * Login id input request data
 */
export type LoginIdInputRQ = {
  /**
   * Username, Email or mobile
   */
  id: string;
};

/**
 * Login id request data
 */
export type LoginIdRQ = LoginIdInputRQ & {
  /**
   * Device id
   */
  deviceId: string;

  /**
   * Country or region
   */
  region: string;

  /**
   * Time zone
   */
  timeZone: string;
};
