import { UserIdentifierType } from "../dto/UserIdentifierType";

/**
 * Check user identifier request data
 * 检查用户编号请求数据
 */
export type CheckUserIdentifierRQ = {
  /**
   * User identifier type
   * 用户编号类型
   */
  type: UserIdentifierType;

  /**
   * Open ID
   * 公开编号
   */
  openid: string;

  /**
   * Device ID
   * 设备编号
   */
  deviceId: string;

  /**
   * Region
   * 区域
   */
  region: string;
};
