/**
 * Identity type
 * 标识类型
 */
export enum IdentityType {
  /**
   * User
   * 用户
   */
  User = 1,

  /**
   * Customer
   * 客户
   */
  Customer = 2,

  /**
   * Supplier
   * 供应商
   */
  Supplier = 4
}

/**
 * Identity type flags
 * 标识类型组合
 */
export enum IdentityTypeFlags {
  /**
   * User
   * 用户
   */
  User = 1,

  /**
   * Customer
   * 客户
   */
  Customer = 2,

  /**
   * Supplier
   * 供应商
   */
  Supplier = 4,

  /**
   * Contact
   * 联系人
   */
  Contact = 8,

  /**
   * Orgnization
   * 机构
   */
  Org = 16
}
