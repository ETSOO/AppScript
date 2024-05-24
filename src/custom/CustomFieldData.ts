import { IdType, ListType2 } from '@etsoo/shared';

/**
 * Custom field space (12 columns)
 * 自定义字段空间（12列）
 */
export type CustomFieldSpace =
    | 'quater'
    | 'half'
    | 'half1'
    | 'full'
    | 'five'
    | 'seven';

/**
 * Custom field data
 * 自定义字段数据
 */
export type CustomFieldData = {
    /**
     * Type
     */
    type: string;

    /**
     * Field name
     */
    name?: string;

    /**
     * Options
     */
    options?: ListType2[];

    /**
     * Refs
     */
    refs?: [string, ...IdType[]];

    /**
     * Space
     */
    space?: CustomFieldSpace;

    /**
     * Grid item proerties
     */
    gridItemProps?: Record<string, any>;

    /**
     * Main slot properties
     */
    mainSlotProps?: Record<string, any>;

    /**
     * Label
     */
    label?: string;

    /**
     * Helper text
     */
    helperText?: string;
};
