import { AuthRequest } from './AuthRequest';
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
     * Authorization request data
     */
    auth?: AuthRequest;
};
