import { ListType, ListType1 } from '@etsoo/shared';

/**
 * Conditional IdLabel type
 */
export type IdLabelConditional<T extends boolean> = T extends true
    ? ListType[]
    : ListType1[];
