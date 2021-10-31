import { DataTypes } from '@etsoo/shared';
import { IdLabelDto } from './IdLabelDto';

/**
 * Dto with id, label and primary field
 */
export type IdLabelPrimaryDto<T extends DataTypes.IdType = number> =
    IdLabelDto<T> & {
        /**
         * Is primary
         */
        readonly isPrimary?: boolean;
    };
