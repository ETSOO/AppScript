/**
 * Application action data
 * 程序动作数据
 */
export type AppActionData = {
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
   * Timestamp, long big number may cause JSON serialization issue
   * 时间戳，长整数可能导致JSON序列化问题
   */
  timestamp: string;

  /**
   * Signature
   * 签名
   */
  sign: string;
};
