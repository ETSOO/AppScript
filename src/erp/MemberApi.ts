import { IApiPayload } from '@etsoo/restclient';
import { ListType1 } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { EntityApi } from './EntityApi';
import { MemberListRQ } from './rq/MemberListRQ';

/**
 * Member API
 */
export class MemberApi extends EntityApi {
    /**
     * Constructor
     * @param app Application
     */
    constructor(app: IApp) {
        super('Member', app);
    }

    /**
     * List
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    list(rq: MemberListRQ, payload: IApiPayload<ListType1[]>) {
        return this.listBase(rq, payload);
    }
}
