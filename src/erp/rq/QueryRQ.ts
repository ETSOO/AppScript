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
     * String id
     */
    sid?: string;

    /**
     * Query paging data
     */
    queryPaging?: QueryPagingData;
};
