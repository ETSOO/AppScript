/**
 * Query request data
 * com.etsoo.CoreFramework.Models.QueryRQ
 */
export type QueryRQ = {
    /**
     * Number id
     */
    id?: number;

    /**
     * String id
     */
    sid?: number;

    /**
     * Current page
     */
    currentPage: number;

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
