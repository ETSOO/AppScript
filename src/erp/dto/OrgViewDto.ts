import { EntityStatus } from '../../business/EntityStatus';

export type OrgViewDto = {
    /**
     * Id
     */
    id: number;

    /**
     * Entity id
     */
    entityId: number;

    /**
     * Trade as
     */
    tradeAs?: string;

    /**
     * Brand, like ETSOO
     */
    brand?: string;

    /**
     * Name, like ETSOO NZ LIMITED
     */
    name: string;

    /**
     * Country or region id, like CN = China
     */
    regionId?: string;

    /**
     * State id
     */
    stateId?: string;

    /**
     * City id
     */
    cityId?: string;

    /**
     * Identifier id
     */
    identifier?: string;

    /**
     * Avatar or logo
     */
    avatar?: string;

    /**
     * Corporate or personal
     */
    corporate?: boolean;

    /**
     * Expiry time
     */
    expiry?: string | Date;

    /**
     * Entity status
     */
    entityStatus: EntityStatus;

    /**
     * Creation
     */
    creation: string | Date;
};
