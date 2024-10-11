import { IApiPayload } from '@etsoo/restclient';
import { IUser } from '../state/User';
import { BaseApi } from './BaseApi';
import { ResultPayload } from './dto/ResultPayload';
import { LoginIdRQ } from './rq/LoginIdRQ';
import { LoginRQ } from './rq/LoginRQ';
import { ResetPasswordRQ } from './rq/ResetPasswordRQ';
import { IActionResult } from '@etsoo/shared';
import { SignoutRQ } from './rq/SignoutRQ';
import { GetSigninUrlRQ } from './rq/GetSigninUrlRQ';
import { TokenRQ } from './rq/TokenRQ';
import { ApiRefreshTokenDto } from './dto/ApiRefreshTokenDto';

/**
 * Authentication API
 */
export class AuthApi extends BaseApi {
    /**
     * API refresh token
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    apiRefreshToken(rq: TokenRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
        return this.api.post('Auth/ApiRefreshToken', rq, payload);
    }

    /**
     * Exchange token
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    exchangeToken(rq: TokenRQ, payload?: IApiPayload<ApiRefreshTokenDto>) {
        return this.api.post('Auth/ExchangeToken', rq, payload);
    }

    /**
     * Get signin url
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    getSigninUrl(rq: GetSigninUrlRQ, payload?: IApiPayload<string>) {
        return this.api.post('Auth/GetSigninUrl', rq, payload);
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
        payload ??= {};
        const result = await this.api.post('Auth/Login', rq, payload);
        const refreshToken = result?.ok
            ? this.app.getResponseToken(payload.response, tokenKey)
            : null;
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
        return this.api.post('Auth/LoginId', rq, payload);
    }

    /**
     * Reset password
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    resetPassword(rq: ResetPasswordRQ, payload?: ResultPayload) {
        return this.api.put('Auth/ResetPassword', rq, payload);
    }

    /**
     * Signout
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    signout(rq: SignoutRQ, payload?: ResultPayload) {
        return this.api.put('Auth/Signout', rq, payload);
    }
}
