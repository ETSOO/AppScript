import { AuthRequest } from "./AuthRequest";
import { LoginIdInputRQ, LoginIdRQ } from "./LoginIdRQ";

/**
 * Login input request data
 */
export type LoginInputRQ = LoginIdInputRQ & {
  /**
   * Password
   */
  pwd: string;

  /**
   * Organization
   */
  org?: number;
};

/**
 * Login input auth result
 */
export type LoginInputAuthResult = {
  /**
   * Redirect URI
   */
  uri: string;
};

/**
 * Login request data
 */
export type LoginRQ = LoginIdRQ &
  LoginInputRQ & {
    /**
     * Authorization request data
     */
    auth?: AuthRequest;
  };
