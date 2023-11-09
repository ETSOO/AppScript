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
     * @returns Result
     */
    protected async loginBase<T extends IUser>(
        rq: LoginRQ,
        payload?: IApiPayload<IActionResult<T>>
    ): Promise<[IActionResult<T> | undefined, string | null]> {
        payload ??= {};
        const result = await this.api.post('Auth/Login', rq, payload);
        const refreshToken = result?.ok
            ? this.app.getResponseToken(payload.response)
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
        return this.api.get('Auth/LoginId', rq, payload);
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
