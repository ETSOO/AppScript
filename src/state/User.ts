import { IState } from "./State";

/**
 * User data interface
 */
export interface IUserData {
  /**
   * Serverside device id encrypted, not the same device id of the app
   */
  readonly deviceId?: string;

  /**
   * User name
   * 用户姓名
   */
  readonly name: string;

  /**
   * Given name
   * 名
   */
  readonly givenName?: string;

  /**
   * Family name
   * 姓
   */
  readonly familyName?: string;

  /**
   * Latin given name
   * 拉丁名（拼音）
   */
  readonly latinGivenName?: string;

  /**
   * Latin family name
   * 拉丁姓（拼音）
   */
  readonly latinFamilyName?: string;

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
   * Is from the channel organization
   * 是否来自渠道机构
   */
  readonly isChannel?: boolean;

  /**
   * Is from the parent organization
   * 是否来自父级机构
   */
  readonly isParent?: boolean;

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

  /**
   * Access token scheme
   * 访问令牌方案
   */
  readonly tokenScheme?: string;
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
