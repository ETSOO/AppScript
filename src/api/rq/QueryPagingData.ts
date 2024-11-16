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
     * Order by fields
     */
    orderBy?: Record<string, boolean>;
};
