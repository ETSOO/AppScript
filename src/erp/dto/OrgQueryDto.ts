/**
 * Organization query data
 */
export type OrgQueryDto = {
    /**
     * Id
     */
    id: number;

    /**
     * Brand, like ETSOO
     */
    brand?: string;

    /**
     * Name, like ETSOO NZ LIMITED
     */
    name: string;

    /**
     * Creation
     */
    creation: string | Date;
};
