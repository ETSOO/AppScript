import { DataTypes } from '@etsoo/shared';

/**
 * Conditional IdLabel type
 */
export type IdLabelConditional<T extends boolean> = T extends true
    ? DataTypes.IdLabelItem<number>[]
    : DataTypes.IdLabelItem<string>[];
