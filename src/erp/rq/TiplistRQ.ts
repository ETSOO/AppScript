import { IdType } from '@etsoo/shared';

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
     * String id
     */
    sid?: string;

    /**
     * Excluded ids
     */
    excludedIds?: T[];

    /**
     * Filter keyword
     */
    keyword?: string;

    /**
     * Max items to return
     */
    items?: number;
};
