import { IdType } from "@etsoo/shared";

/**
 * Update model
 * 更新模型
 */
export interface UpdateModel<T extends IdType = number> {
  /**
   * Id
   * 编号
   */
  id: T;

  /**
   * Changed (modified) fields
   * 'Exclude' items from a union type while 'omit' items from an object type.
   * 更改的字段，注意 'Exclude' 用于联合类型，'omit' 用于对象类型。
   */
  changedFields?: Exclude<keyof this, "changedFields">[];
}
