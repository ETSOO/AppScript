/**
 * Organization add/edit request data
 */
export type OrgRQ = {
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
};
