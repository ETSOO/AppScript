import { DataTypes } from '@etsoo/shared';
import { LoginIdRQ } from './LoginIdRQ';

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
     * Time zone
     */
    timezone?: string;

    /**
     * Service id or uid
     */
    serviceId?: DataTypes.IdType;
};
