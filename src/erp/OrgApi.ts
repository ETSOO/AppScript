import { IApiPayload } from '@etsoo/restclient';
import { DataTypes, ListType } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { OrgDto } from './dto/OrgDto';
import { OrgQueryDto } from './dto/OrgQueryDto';
import { OrgViewDto } from './dto/OrgViewDto';
import { IdResultPayload } from './dto/ResultPayload';
import { EntityApi } from './EntityApi';
import { OrgListRQ } from './rq/OrgListRQ';
import { OrgQueryRQ } from './rq/OrgQueryRQ';

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
                { items, serviceId },
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
     * @returns Result
     */
    read(id: number, payload?: IApiPayload<OrgQueryDto[]>) {
        return this.readBase(id, payload);
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
        data: DataTypes.AddOrEditType<OrgViewDto, true>,
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
