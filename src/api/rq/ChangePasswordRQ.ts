export type ChangePasswordRQ = {
  /**
   * Device id
   * 设备编号
   */
  deviceId: string;

  /**
   * Current password
   * 当前密码
   */
  oldPassword: string;

  /**
   * New password
   * 新密码
   */
  password: string;
};
