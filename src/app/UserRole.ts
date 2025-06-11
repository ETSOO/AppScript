/**
 * Standard user roles
 * @see com.etsoo.CoreFramework.Authentication.UserRole
 */
export enum UserRole {
  /**
   * Guest
   * 访客
   */
  Guest = 1,

  /**
   * Operator
   * 操作员
   */
  Operator = 4,

  /**
   * Partner
   * 渠道合作伙伴
   */
  Partner = 8,

  /**
   * User
   * 用户
   */
  User = 16,

  /**
   * Team leader
   * 团队负责人
   */
  Leader = 32,

  /**
   * Manager
   * 经理
   */
  Manager = 64,

  /**
   * HR Manager
   * 人事经理
   */
  HRManager = 128,

  /**
   * Finance
   * 财务
   */
  Finance = 256,

  /**
   * Director
   * 总监
   */
  Director = 512,

  /**
   * Executives
   * 高管
   */
  Executive = 1024,

  /**
   * API
   * 接口
   */
  API = 4096,

  /**
   * Administrator
   * 管理员
   */
  Admin = 8192,

  /**
   * Founder, takes all ownership
   * 创始人，所有权限
   */
  Founder = 16384
}
