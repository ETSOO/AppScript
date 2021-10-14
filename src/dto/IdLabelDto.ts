import { DataTypes } from '@etsoo/shared';

/**
 * Dto with id and label field
 */
export type IdLabelDto = {
    /**
     * Id
     */
    readonly id: DataTypes.IdType;

    /**
     * Label
     */
    label: string;
};
