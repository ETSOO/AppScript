import { IdType } from '@etsoo/shared';
import { EntityStatus } from '../../business/EntityStatus';

/**
 * Update status request data
 */
export type UpdateStatusRQ = {
    /**
     * Id
     */
    id: IdType;

    /**
     * New status
     */
    status: EntityStatus;
};
