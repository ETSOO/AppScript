import { DataTypes } from '@etsoo/shared';

/**
 * Query request data
 * com.etsoo.CoreFramework.Models.QueryRQ
 */
export type QueryRQ<T extends DataTypes.IdType = number> = {
    /**
     * Number id
     */
    id?: T;

    /**
     * String id
     */
    sid?: string;

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
