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
     * Batch size
     */
    batchSize: number;

    /**
     * Order by field name
     */
    orderBy?: string;

    /**
     * Order by ascending
     */
    orderByAsc?: boolean;
};
