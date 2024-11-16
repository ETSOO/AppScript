import { IdType } from '@etsoo/shared';
import { QueryPagingData } from './QueryPagingData';

/**
 * Query request data
 * com.etsoo.CoreFramework.Models.QueryRQ
 */
export type QueryRQ<T extends IdType = number> = {
    /**
     * Number id
     */
    id?: T;

    /**
     * Included ids
     */
    ids?: T[];

    /**
     * Excluded ids
     */
    excludedIds?: T[];

    /**
     * Filter keyword
     */
    keyword?: string;

    /**
     * Query paging data or items to read
     */
    queryPaging?: QueryPagingData | number;
};
