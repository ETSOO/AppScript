import { DataTypes } from '@etsoo/shared';

/**
 * Id & label data
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
