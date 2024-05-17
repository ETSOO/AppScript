import { IdType } from '@etsoo/shared';
import { QueryPagingData } from './QueryPagingData';

/**
 * Tiplist request data
 * com.etsoo.CoreFramework.Models.TiplistRQ
 */
export type TiplistRQ<T extends IdType = number> = {
    /**
     * number id
     */
    id?: T;

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
