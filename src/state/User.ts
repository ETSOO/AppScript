import { IState } from './State';

/**
 * User data interface
 */
export interface IUserData {
    /**
     * Serverside device id encrypted
     */
    readonly deviceId: string;

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
     * User role value
     */
    readonly role: number;

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
 * User data property keys
 */
export type UserKey = keyof IUserData;

/**
 * User interface
 */
export interface IUser extends IUserData, IState {
    /**
     * Authorized or not
     */
    authorized: boolean;

    /**
     * Last update changed fields
     */
    lastChangedFields?: UserKey[];
}
