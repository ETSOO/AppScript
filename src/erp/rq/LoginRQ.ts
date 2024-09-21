import { LoginIdRQ } from './LoginIdRQ';
import { AuthRequest } from './AuthRequest';

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
     * Authorization request data
     */
    auth?: AuthRequest;
};
