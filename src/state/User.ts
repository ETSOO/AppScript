import { IState } from './State';

/**
 * User data interface
 */
export interface IUserData {
    /**
     * User name
     */
    readonly name: string;

    /**
     * User avatar
     */
    readonly avatar?: string;

    /**
     * Organization id
     */
    readonly organization?: number;

    /**
     * Refresh seconds
     */
    readonly seconds: number;

    /**
     * Access token
     */
    readonly token: string;
}

/**
 * User interface
 */
export interface IUser extends IUserData, IState {
    /**
     * Authorized or not
     */
    authorized: boolean;
}
