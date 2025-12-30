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
 * Remove contact definition, because contact is a relationship, not an identity
 * com.etsoo.CoreFramework.Business.IdentityTypeFlags
 * 标识类型带标志，删除联系人定义，因为联系人是一种关系，不是身份
 */
export enum IdentityTypeFlags {
  /**
   * None
   * 无标识
   */
  None = 0,

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
   * Orgnization
   * 机构
   */
  Org = 16,

  /**
   * Department
   * 部门
   */
  Dept = 32
}
