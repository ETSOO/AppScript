import { DataTypes } from '@etsoo/shared';

/**
 * Dto with id and label field
 */
export type IdLabelDto<T extends DataTypes.IdType = number> =
    DataTypes.IdItem<T> & {
        /**
         * Label
         */
        label: string;
    };

/**
 * Conditional IdLabel type
 */
export type IdLabelConditional<T extends boolean> = T extends true
    ? IdLabelDto<number>[]
    : IdLabelDto<string>[];
