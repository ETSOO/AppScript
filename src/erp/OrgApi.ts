import { IApiPayload } from '@etsoo/restclient';
import { DataTypes, ListType } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { IdActionResult } from '../result/IActionResult';
import { OrgQueryDto } from './dto/OrgQueryDto';
import { EntityApi } from './EntityApi';
import { OrgListRQ } from './rq/OrgListRQ';
import { OrgQueryRQ } from './rq/OrgQueryRQ';
import { OrgRQ } from './rq/OrgRQ';

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
     * @returns Result
     */
    list(items?: number, serviceId?: number): Promise<ListType[] | undefined>;
    list(rq: OrgListRQ): Promise<ListType[] | undefined>;
    list(
        items?: number | OrgListRQ,
        serviceId?: number,
        payload?: IApiPayload<ListType[]>
    ) {
        payload ??= { defaultValue: [], showLoading: false };
        const rq = typeof items === 'object' ? items : { items, serviceId };
        return this.listBase(rq, payload);
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
     * Switch organization
     * @param id Organization id
     * @param serviceId Service id
     */
    async switch(
        id: number,
        serviceId?: number,
        payload?: IApiPayload<boolean>
    ) {
        const result = await this.app.api.put<boolean>(
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
        data: DataTypes.AddOrEditType<OrgRQ, true>,
        payload?: IApiPayload<IdActionResult>
    ) {
        return super.updateBase<IdActionResult>(data, payload);
    }
}
