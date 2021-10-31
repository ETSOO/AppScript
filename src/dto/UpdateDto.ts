import { DataTypes } from '@etsoo/shared';
import { IdDto } from './IdDto';

/**
 * Dto with id and changedFields
 */
export type UpdateDto<T extends DataTypes.IdType = number> = IdDto<T> & {
    /**
     * Changed fields
     */
    changedFields?: string[];
};
