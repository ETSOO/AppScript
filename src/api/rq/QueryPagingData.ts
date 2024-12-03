/**
 * Query paging order
 * 查询分页排序
 */
export type QueryPagingOrder = {
  /**
   * Field name
   */
  field: string;

  /**
   * Descending
   */
  desc?: boolean;

  /**
   * Is unique value
   */
  unique?: boolean;
};

/**
 * Query paging data
 * 查询分页数据
 */
export type QueryPagingData = {
  /**
   * Current page
   */
  currentPage?: number;

  /**
   * Keyset array, same order as the order by fields
   */
  keysets?: unknown[];

  /**
   * Batch size
   */
  batchSize: number;

  /**
   * Order by fields, key is field name, value is true for descending, false for ascending
   */
  orderBy?: QueryPagingOrder[];
};
