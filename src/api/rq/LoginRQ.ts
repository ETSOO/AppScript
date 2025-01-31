import { AuthRequest } from "./AuthRequest";
import { LoginIdRQ } from "./LoginIdRQ";

/**
 * Login request data
 */
export type LoginRQ = LoginIdRQ & {
  /**
   * Password
   */
  pwd: string;

  /**
   * Organization
   */
  org?: number;

  /**
   * Authorization request data
   */
  auth?: AuthRequest;
};

/**
 * Login input request data
 */
export type LoginInputRQ = Pick<LoginRQ, "id" | "pwd" | "org" | "auth">;
