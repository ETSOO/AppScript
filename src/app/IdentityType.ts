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
   * User or customer
   * 用户或客户
   */
  UserOrCustomer = 3,

  /**
   * Supplier
   * 供应商
   */
  Supplier = 4,

  /**
   * User or supplier
   * 用户或供应商
   */
  UserOrSupplier = 5,

  /**
   * Customer or supplier
   * 客户或供应商
   */
  CustomerOrSupplier = 6,

  /**
   * User or customer or supplier
   * 用户或客户或供应商
   */
  UserOrCustomerOrSupplier = 7
}
