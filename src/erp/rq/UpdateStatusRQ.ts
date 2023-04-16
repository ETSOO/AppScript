import { DataTypes } from '@etsoo/shared';
import { EntityStatus } from '../../business/EntityStatus';

/**
 * Update status request data
 */
export type UpdateStatusRQ = {
    /**
     * Id
     */
    id: DataTypes.IdType;

    /**
     * New status
     */
    status: EntityStatus;
};
