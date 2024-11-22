/**
 * API service enum
 */
export enum ApiService {
  /**
   * SMTP
   * 邮件发送
   */
  SMTP = 1,

  /**
   * SMTP delegation
   * 邮件发送代理
   */
  SMTPDelegation = 2,

  /**
   * SMS
   * 短信发送
   */
  SMS = 3,

  /**
   * Wechat service account
   * 微信服务号
   */
  Wechat = 4,

  /**
   * Business Wechat
   * 企业微信
   */
  WechatBusiness = 5
}
