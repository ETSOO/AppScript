import { IApiPayload } from "@etsoo/restclient";
import { IUser } from "../state/User";
import { BaseApi } from "./BaseApi";
import { ResultPayload } from "./dto/ResultPayload";
import { ActionResult, DataTypes, IActionResult } from "@etsoo/shared";
import { RefreshTokenProps, RefreshTokenResult } from "../app/IApp";
import { TokenInputRQ, TokenRQ } from "./rq/TokenRQ";
import { ApiRefreshTokenDto } from "./dto/ApiRefreshTokenDto";
import { GetLogInUrlRQ } from "./rq/GetLogInUrlRQ";
import { LoginInputAuthResult, LoginInputRQ, LoginRQ } from "./rq/LoginRQ";
import { LoginIdRQ } from "./rq/LoginIdRQ";
import { RefreshTokenRQ } from "./rq/RefreshTokenRQ";
import { ResetPasswordInputRQ, ResetPasswordRQ } from "./rq/ResetPasswordRQ";
import { SignoutRQ } from "./rq/SignoutRQ";
import { SwitchOrgRQ } from "./rq/SwitchOrgRQ";
import { AuthRequest } from "./rq/AuthRequest";
import { ChangePasswordRQ } from "./rq/ChangePasswordRQ";
import { CheckUserIdentifierRQ } from "./rq/CheckUserIdentifierRQ";
import { AdminSupportRQ } from "./rq/AdminSupportRQ";

/**
 * Authentication API
 */
export class AuthApi extends BaseApi {
  /**
   * Header token field name
   */
  static HeaderTokenField = "Etsoo-Refresh-Token";

  /**
   * Admin support
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  adminSupport(
    rq: AdminSupportRQ,
    payload?: IApiPayload<IActionResult<LoginInputAuthResult>>
  ) {
    return this.api.post("Auth/AdminSupport", rq, payload);
  }

  /**
   * API refresh token
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  apiRefreshToken(rq: TokenInputRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
    const data: TokenRQ = { ...rq, timeZone: this.app.getTimeZone() };
    return this.api.put("Auth/ApiRefreshToken", data, payload);
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
   * @param payload Payload
   * @returns Result
   */
  changePassword(
    oldPassword: string,
    password: string,
    payload?: ResultPayload
  ) {
    const rq: ChangePasswordRQ = {
      appId: this.app.settings.appId,
      deviceId: this.app.deviceId,
      oldPassword: this.app.encrypt(this.app.hash(oldPassword)),
      password: this.app.encrypt(this.app.hash(password))
    };
    return this.api.put("Auth/ChangePassword", rq, payload);
  }

  /**
   * Check user identifier
   * @param type User identifier type
   * @param openid Open ID
   * @param payload Payload
   * @returns Result
   */
  checkUserIdentifier(
    type: CheckUserIdentifierRQ["type"],
    openid: CheckUserIdentifierRQ["openid"],
    payload?: IApiPayload<DataTypes.TristateEnum>
  ) {
    const rq: CheckUserIdentifierRQ = {
      type,
      openid: this.app.encrypt(openid),
      deviceId: this.app.deviceId,
      region: this.app.region
    };
    return this.api.post("Auth/CheckUserIdentifier", rq, payload);
  }

  /**
   * Exchange token
   * @param rq Request data
   * @param payload Payload
   * @returns Result
   */
  exchangeToken(rq: TokenInputRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
    const data: TokenRQ = { ...rq, timeZone: this.app.getTimeZone() };
    return this.api.put("Auth/ExchangeToken", data, payload);
  }

  /**
   * Get auth request
   * @param deviceId Device ID
   * @param payload Payload
   * @param apiHost API host
   * @returns Result
   */
  getAuthRequest(
    deviceId?: string,
    payload?: IApiPayload<AuthRequest>,
    apiHost?: string
  ) {
    const rq: GetLogInUrlRQ = {
      region: this.app.region,
      device: deviceId ?? this.app.deviceId
    };
    return this.api.post(`${apiHost ?? ""}Auth/GetAuthRequest`, rq, payload);
  }

  /**
   * Get log in url
   * @param deviceId Device ID
   * @param payload Payload
   * @param apiHost API host
   * @returns Result
   */
  getLogInUrl(
    deviceId?: string,
    payload?: IApiPayload<string>,
    apiHost?: string
  ) {
    const rq: GetLogInUrlRQ = {
      region: this.app.region,
      device: deviceId ?? this.app.deviceId
    };
    return this.api.get(`${apiHost ?? ""}Auth/GetLogInUrl`, rq, payload);
  }

  /**
   * Login
   * @param rq Request data
   * @param payload Payload
   * @param tokenKey Refresh token key
   * @returns Result
   */
  async login<T extends IUser>(
    rq: LoginInputRQ,
    payload?: IApiPayload<IActionResult<T | LoginInputAuthResult>>,
    tokenKey?: string
  ): Promise<
    [IActionResult<T | LoginInputAuthResult> | undefined, string | null]
  > {
    // Default values
    payload ??= {};
    tokenKey ??= AuthApi.HeaderTokenField;

    const data: LoginRQ = {
      ...rq,
      deviceId: this.app.deviceId,
      region: this.app.region,
      timeZone: this.app.getTimeZone()
    };

    // Call the API
    const result = await this.api.post("Auth/Login", data, payload);

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
      region,
      timeZone: this.app.getTimeZone()
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
      deviceId: this.app.deviceId,
      timeZone: this.app.getTimeZone()
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
  resetPassword(rq: ResetPasswordInputRQ, payload?: ResultPayload) {
    const data: ResetPasswordRQ = {
      ...rq,
      deviceId: this.app.deviceId,
      region: this.app.region,
      timezone: this.app.getTimeZone()
    };
    return this.api.put("Auth/ResetPassword", data, payload);
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
   * @param tokenKey Refresh token key
   * @param payload Payload
   */
  async switchOrg<T extends IUser>(
    rq: SwitchOrgRQ,
    payload?: IApiPayload<IActionResult<T>>,
    tokenKey?: string
  ): Promise<[IActionResult<T> | undefined, string | null]> {
    // Default values
    payload ??= {};
    tokenKey ??= AuthApi.HeaderTokenField;

    // Call the API
    const result = await this.api.put("Auth/SwitchOrg", rq, payload);

    // Get the refresh token
    const refreshToken = result?.ok
      ? this.app.getResponseToken(payload.response, tokenKey)
      : null;

    // Return the result
    return [result, refreshToken];
  }
}
