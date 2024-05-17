import { IApiPayload } from '@etsoo/restclient';
import { DataTypes, ListType } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { OrgDto } from './dto/OrgDto';
import { OrgQueryDto } from './dto/OrgQueryDto';
import { OrgViewDto } from './dto/OrgViewDto';
import { IdResultPayload, StringIdResultPayload } from './dto/ResultPayload';
import { EntityApi } from './EntityApi';
import { OrgListRQ } from './rq/OrgListRQ';
import { OrgQueryRQ } from './rq/OrgQueryRQ';
import { SendActionMessageRQ } from './rq/SendActionMessageRQ';
import { ApiService } from '../business/ApiService';

const cachedOrgs: { [P: number]: OrgViewDto | undefined | null } = {};

/**
 * Organization API
 */
export class OrgApi extends EntityApi {
    /**
     * Constructor
     * @param app Application
     */
    constructor(app: IApp) {
        super('Organization', app);
    }

    /**
     * Check API service's availability
     * @param api API service id
     * @param payload Payload
     * @returns Result
     */
    checkApiService(api: ApiService, payload?: StringIdResultPayload) {
        payload ??= { showLoading: false };
        return this.api.get(`${this.flag}/CheckApiService`, { api }, payload);
    }

    /**
     * Get organization list
     * @param items Max items or request data
     * @param serviceId Service id
     * @param payload Payload
     * @returns Result
     */
    list(items?: number, serviceId?: number): Promise<ListType[] | undefined>;
    list(
        rq: OrgListRQ,
        payload?: IApiPayload<ListType[]>
    ): Promise<ListType[] | undefined>;
    list<T extends number | OrgListRQ>(
        items?: T,
        serviceId?: T extends number ? number : IApiPayload<ListType[]>
    ) {
        if (typeof items === 'object') {
            if (typeof serviceId === 'number') return undefined;
            return this.listBase(items, serviceId);
        } else {
            if (typeof serviceId === 'object') return undefined;
            return this.listBase<number, OrgListRQ, ListType>(
                { queryPaging: items, serviceId },
                { defaultValue: [], showLoading: false }
            );
        }
    }

    /**
     * Query
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    query(rq: OrgQueryRQ, payload?: IApiPayload<OrgQueryDto[]>) {
        return this.queryBase(rq, payload);
    }

    /**
     * Read
     * @param id Id
     * @param payload Payload
     * @param reload Reload data
     * @returns Result
     */
    async read(
        id: number,
        payload?: IApiPayload<OrgViewDto>,
        reload: boolean = false
    ) {
        let data = cachedOrgs[id];
        if (data == null || reload) {
            data = await this.readBase(id, payload);
            if (data != null) cachedOrgs[id] = data;
        }
        return data;
    }

    /**
     * Send action message
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    sendActionMessage(rq: SendActionMessageRQ, payload?: IApiPayload<void>) {
        const appId =
            'serviceId' in this.app.settings ? this.app.settings.serviceId : 0;
        payload ??= { showLoading: false };
        return this.api.post(
            'System/SendActionMessage',
            { ...rq, appId },
            payload
        );
    }

    /**
     * Switch organization
     * @param id Organization id
     * @param serviceId Service id
     * @param payload Payload
     */
    async switch(
        id: number,
        serviceId?: number,
        payload?: IApiPayload<boolean>
    ) {
        const result = await this.app.api.put(
            'Organization/Switch',
            {
                id,
                serviceId,
                deviceId: this.app.deviceId
            },
            payload
        );
        if (result) return await this.app.refreshToken();
        return result;
    }

    /**
     * Update
     * @param data Modal data
     * @param payload Payload
     * @returns Result
     */
    update(
        data: DataTypes.AddOrEditType<OrgDto, true>,
        payload?: IdResultPayload
    ) {
        return super.updateBase(data, payload);
    }

    /**
     * Read for update
     * @param id Id
     * @param payload Payload
     * @returns Result
     */
    updateRead(id: number, payload?: IApiPayload<OrgDto>) {
        return super.updateReadBase(id, payload);
    }
}
