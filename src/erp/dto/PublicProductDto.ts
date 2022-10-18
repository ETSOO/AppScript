import { DataTypes } from '@etsoo/shared';
import { EntityStatus } from '../../business/EntityStatus';

/**
 * Public product data
 */
export type PublicProductDto = {
    /**
     * Id
     */
    id: number;

    /**
     * Name
     */
    name: string;

    /**
     * Logo
     */
    logo?: string;

    /**
     * Web URL for access
     */
    webUrl: string;

    /**
     * Query id for service Id / service Uid
     */
    queryId?: DataTypes.IdType;
};

/**
 * Public product with organization data
 */
export type PublicOrgProductDto = PublicProductDto & {
    /**
     * Purchased service status
     */
    serviceEntityStatus?: EntityStatus;

    /**
     * Purchased service expiry
     */
    serviceExpiry?: string | Date;
};
