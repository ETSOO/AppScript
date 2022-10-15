import { TiplistRQ } from './TiplistRQ';

/**
 * Organization list request data
 */
export type OrgListRQ = TiplistRQ & {
    /**
     * Service id
     */
    serviceId?: number;
};
