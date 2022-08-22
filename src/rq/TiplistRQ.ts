import { DataTypes } from '@etsoo/shared';

/**
 * Tiplist request data
 * com.etsoo.CoreFramework.Models.TiplistRQ
 */
export type TiplistRQ = {
    /**
     * number id
     */
    id?: number;

    /**
     * String id
     */
    sid?: string;

    /**
     * Excluded ids
     */
    excludedIds?: DataTypes.IdType[];

    /**
     * Filter keyword
     */
    keyword?: string;

    /**
     * Max items to return
     */
    items?: number;
};
