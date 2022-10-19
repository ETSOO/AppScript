/**
 * Organization data
 */
export type OrgDto = {
    /**
     * Id
     */
    id: number;

    /**
     * Region id
     */
    regionId: string;

    /**
     * Name
     */
    name: string;

    /**
     * Identifier
     */
    identifier: string;

    /**
     * Brand
     */
    brand?: string;

    /**
     * Trade as
     */
    tradeAs?: string;

    /**
     * Parent organization
     */
    parentId?: number;
};
