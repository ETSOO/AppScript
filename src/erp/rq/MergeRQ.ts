import { DataTypes } from '@etsoo/shared';

/**
 * Merge request data
 */
export type MergeRQ<T extends DataTypes.IdType> = {
    /**
     * Source id
     */
    sourceId: T;

    /**
     * Target id
     */
    targetId: T;

    /**
     * Delete source at the same time
     */
    deleteSource?: boolean;
};
