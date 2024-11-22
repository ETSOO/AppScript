import { IActionResult } from "@etsoo/shared";

/**
 * Init call result data
 */
export interface InitCallResultData {
  /**
   * Device id
   */
  deviceId?: string;

  /**
   * Secret passphrase
   */
  passphrase?: string;

  /**
   * Previous secret passphrase
   */
  previousPassphrase?: string;

  /**
   * Actual seconds gap
   */
  seconds?: number;

  /**
   * Valid seconds gap
   */
  validSeconds?: number;
}

/**
 * Init call result
 */
export type InitCallResult = IActionResult<InitCallResultData>;
