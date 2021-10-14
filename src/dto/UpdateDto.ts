import { IdDto } from './IdDto';

/**
 * Dto with id and changedFields
 */
export type UpdateDto<T = number> = IdDto<T> & {
    /**
     * Changed fields
     */
    changedFields?: string[];
};
