import { IApiPayload } from '@etsoo/restclient';
import { IUser } from '../state/User';
import { BaseApi } from './BaseApi';
import { ResultPayload } from './dto/ResultPayload';
import { LoginIdRQ } from './rq/LoginIdRQ';
import { LoginRQ } from './rq/LoginRQ';
import { ResetPasswordRQ } from './rq/ResetPasswordRQ';
import { IActionResult } from '@etsoo/shared';

/**
 * Authentication API
 */
export class AuthApi extends BaseApi {
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
     * Get log in url
     * @returns Url
     */
    getLogInUrl() {
        return this.api.get<string>('Auth/GetLogInUrl', {
            region: this.app.region,
            device: this.app.deviceId
        });
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
     * Redirect to log in url
     */
    async redirectToLogInUrl() {
        const url = await this.getLogInUrl();
        if (url == null) return;
        globalThis.location.replace(url);
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
}
