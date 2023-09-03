import { IApi } from '@etsoo/restclient';

/**
 * Service application API, Implement interface calls between different services
 * 服务程序接口，实现不同服务之间的接口调用
 */
export interface IAppApi {
    /**
     * API
     */
    readonly api: IApi<any>;

    /**
     * Service id
     */
    readonly serviceId: number;

    /**
     * Authorize the API
     * @param token Access token
     */
    authorize(token: string): void;

    /**
     * Get refresh token data
     */
    getrefreshTokenData(): Object;
}
