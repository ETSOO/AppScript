import { QueryRQ } from './QueryRQ';

/**
 * Organization query request data
 */
export type OrgQueryRQ = QueryRQ & {
    /**
     * Name
     */
    name?: string;

    /**
     * Parent organization id
     */
    parentId?: number;
};
