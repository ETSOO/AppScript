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
