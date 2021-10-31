import { DataTypes } from '@etsoo/shared';

/**
 * Dto with id field
 */
export type IdDto<T extends DataTypes.IdType = number> = {
    /**
     * Id
     */
    readonly id: T;
};
