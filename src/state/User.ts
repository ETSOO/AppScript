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
     * 用户姓名
     */
    readonly name: string;

    /**
     * User avatar
     * 用户头像
     */
    readonly avatar?: string;

    /**
     * Organization id
     * 机构编号
     */
    readonly organization?: number;

    /**
     * User role value
     * 用户角色值
     */
    readonly role: number;

    /**
     * Refresh seconds
     * 刷新间隔秒数
     */
    readonly seconds: number;

    /**
     * Access token
     * 访问令牌
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
