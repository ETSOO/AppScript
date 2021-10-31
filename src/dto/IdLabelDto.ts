import { DataTypes } from '@etsoo/shared';
import { IdDto } from './IdDto';

/**
 * Dto with id and label field
 */
export type IdLabelDto<T extends DataTypes.IdType = number> = IdDto<T> & {
    /**
     * Label
     */
    label: string;
};

/**
 * Conditional IdLabel type
 */
export type IdLabelConditional<T extends boolean> = T extends true
    ? IdLabelDto[]
    : IdLabelDto<string>[];
