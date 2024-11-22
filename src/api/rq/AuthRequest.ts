/**
 * Application authentication request object
 * 程序认证请求对象
 */
export type AuthRequest = {
  /**
   * Application ID
   * 应用编号
   */
  appId: number;

  /**
   * Application key
   * 应用键值
   */
  appKey: string;

  /**
   * login hint (user login name)
   * 登录提示（个人登录名）
   */
  loginHint?: string;

  /**
   * Redirect URI
   * 重定向URI
   */
  redirectUri: string;

  /**
   * Response type, code or token
   * 响应类型，代码或令牌
   */
  responseType: "code" | "token";

  /**
   * Scope
   * 作用域
   */
  scope: string;

  /**
   * State value
   * 状态值
   */
  state: string;

  /**
   * Signature
   * 签名
   */
  sign: string;
};
