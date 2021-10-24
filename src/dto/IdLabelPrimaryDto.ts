import { IdLabelDto } from './IdLabelDto';

/**
 * Dto with id, label and primary field
 */
export type IdLabelPrimaryDto = IdLabelDto & {
    /**
     * Is primary
     */
    readonly isPrimary?: boolean;
};
