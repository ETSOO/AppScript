/**
 * Data privacy
 * 数据隐私
 * @link com.etsoo.CoreFramework.Business.DataPrivacy
 */
export enum DataPrivacy {
  /// <summary>
  /// Public
  /// 完全公开
  /// </summary>
  Public = 0,

  /// <summary>
  /// Customer disclosure
  /// 客户可见
  /// </summary>
  Customer = 20,

  /// <summary>
  /// Channel disclosure
  /// 渠道可见
  /// </summary>
  Channel = 30,

  /// <summary>
  /// Internal
  /// 内部可见
  /// </summary>
  Internal = 40,

  /// <summary>
  /// Dept disclosure
  /// 部门可见
  /// </summary>
  Dept = 60,

  /// <summary>
  /// Admin disclosure
  /// 管理员可见
  /// </summary>
  Admin = 80,

  /// <summary>
  /// Private
  /// 创建者私有
  /// </summary>
  Private = 100
}
