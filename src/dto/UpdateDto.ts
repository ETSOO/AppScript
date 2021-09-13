import { DataTypes } from '@etsoo/shared';

/**
 * Update Dto
 */
export type UpdateDto = {
    /**
     * Id
     */
    id: DataTypes.IdType;

    /**
     * Changed fields
     */
    changedFields?: string[];
};
