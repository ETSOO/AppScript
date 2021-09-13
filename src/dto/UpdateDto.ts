import { IdDto } from './IdDto';

/**
 * Update Dto
 */
export type UpdateDto<T = number> = IdDto<T> & {
    /**
     * Changed fields
     */
    changedFields?: string[];
};
