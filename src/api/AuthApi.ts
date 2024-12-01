import { IApiPayload } from "@etsoo/restclient";
import { IUser } from "../state/User";
import { BaseApi } from "./BaseApi";
import { ResultPayload } from "./dto/ResultPayload";
import { ActionResult, IActionResult } from "@etsoo/shared";
import { RefreshTokenProps, RefreshTokenResult } from "../app/IApp";
import { TokenRQ } from "./rq/TokenRQ";
import { ApiRefreshTokenDto } from "./dto/ApiRefreshTokenDto";
import { GetLogInUrlRQ } from "./rq/GetLogInUrlRQ";
import { LoginRQ } from "./rq/LoginRQ";
import { LoginIdRQ } from "./rq/LoginIdRQ";
import { RefreshTokenRQ } from "./rq/RefreshTokenRQ";
import { ResetPasswordRQ } from "./rq/ResetPasswordRQ";
import { SignoutRQ } from "./rq/SignoutRQ";
import { SwitchOrgRQ } from "./rq/SwitchOrgRQ";
import { AuthRequest } from "./rq/AuthRequest";
import { ChangePasswordRQ } from "./rq/ChangePasswordRQ";

/**
 * Authentication API
 */
export class AuthApi extends BaseApi {
  /**
   * Header token field name
   */
  static HeaderTokenField = "Etsoo-Refresh-Token";

  /**
   * API refresh token
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  apiRefreshToken(rq: TokenRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
    return this.api.put("Auth/ApiRefreshToken", rq, payload);
  }

  /**
   * Authorization request
   * @param auth Authorization request data
   * @param payload Payload
   */
  authRequest(auth: AuthRequest, payload?: IApiPayload<string>) {
    return this.api.post("Auth/AuthRequest", auth, payload);
  }

  /**
   * Change password
   * @param oldPassword Ole password
   * @param password New password
   * @param isSecure Is secure or not
   * @param payload Payload
   * @returns Result
   */
  changePassword(
    oldPassword: string,
    password: string,
    isSecure?: boolean,
    payload?: ResultPayload
  ) {
    const rq: ChangePasswordRQ =
      isSecure === false
        ? {
            oldPassword: this.app.hash(oldPassword),
            password: this.app.hash(password)
          }
        : {
            deviceId: this.app.deviceId,
            oldPassword: this.app.encrypt(this.app.hash(oldPassword)),
            password: this.app.encrypt(this.app.hash(password))
          };
    return this.api.put("Auth/ChangePassword", rq, payload);
  }

  /**
   * Exchange token
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  exchangeToken(rq: TokenRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
    return this.api.put("Auth/ExchangeToken", rq, payload);
  }

  /**
   * Get log in url
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  getLogInUrl(rq: GetLogInUrlRQ, payload?: IApiPayload<string>) {
    return this.api.get("Auth/GetLogInUrl", rq, payload);
  }

  /**
   * Login
   * @param rq Request data
   * @param payload Payload
   * @param tokenKey Refresh token key
   * @returns Result
   */
  protected async loginBase<T extends IUser>(
    rq: LoginRQ,
    payload?: IApiPayload<IActionResult<T>>,
    tokenKey?: string
  ): Promise<[IActionResult<T> | undefined, string | null]> {
    // Default values
    payload ??= {};
    tokenKey ??= AuthApi.HeaderTokenField;

    // Call the API
    const result = await this.api.post("Auth/Login", rq, payload);

    // Get the refresh token
    const refreshToken = result?.ok
      ? this.app.getResponseToken(payload.response, tokenKey)
      : null;

    // Return the result
    return [result, refreshToken];
  }

  /**
   * Login id check
   * @param id Check id
   * @param payload Payload
   * @returns Result
   */
  loginId(id: string, payload?: ResultPayload) {
    const { deviceId, region } = this.app;
    id = this.app.encrypt(id);
    const rq: LoginIdRQ = {
      id,
      deviceId,
      region
    };
    return this.api.post("Auth/LoginId", rq, payload);
  }

  /**
   * Refresh token
   * @param props Props
   * @returns Result
   */
  async refreshToken<R>(
    props: RefreshTokenProps
  ): Promise<RefreshTokenResult<R>> {
    // Destruct
    const {
      api = "Auth/RefreshToken",
      showLoading = false,
      token,
      tokenField = AuthApi.HeaderTokenField
    } = props ?? {};

    // Check the token
    if (!token) {
      return {
        ok: false,
        type: "noData",
        field: "token",
        title: this.app.get("noData")
      };
    }

    // Reqest data
    const rq: RefreshTokenRQ = {
      deviceId: this.app.deviceId
    };

    // Payload
    const payload: IApiPayload<R, any> = {
      // No loading bar needed to avoid screen flicks
      showLoading,
      config: { headers: { [tokenField]: token } },
      onError: () => {
        // Prevent further processing
        return false;
      }
    };

    // Call API
    const result = await this.api.put(api, rq, payload);
    if (result == null) {
      return this.api.lastError
        ? ActionResult.create(this.api.lastError)
        : {
            ok: false,
            type: "unknownError",
            field: "result",
            title: this.app.get("unknownError")
          };
    }

    // Token
    const refreshToken = this.app.getResponseToken(
      payload.response,
      tokenField
    );

    // Success
    return [refreshToken, result];
  }

  /**
   * Reset password
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  resetPassword(rq: ResetPasswordRQ, payload?: ResultPayload) {
    return this.api.put("Auth/ResetPassword", rq, payload);
  }

  /**
   * Signout
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  signout(rq: SignoutRQ, payload?: ResultPayload) {
    return this.api.put("Auth/Signout", rq, payload);
  }

  /**
   * Switch organization
   * @param rq Request data
   * @param payload Payload
   */
  switchOrg(rq: SwitchOrgRQ, payload?: ResultPayload) {
    return this.app.api.put("Auth/SwitchOrg", rq, payload);
  }
}