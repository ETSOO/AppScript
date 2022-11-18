import { IApi, IApiPayload } from '@etsoo/restclient';
import { DataTypes } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { IActionResult } from '../result/IActionResult';
import { BaseApi } from './BaseApi';
import { AuditLineDto, AuditLinePayload } from './dto/AuditLineDto';
import { QueryRQ } from './rq/QueryRQ';
import { TiplistRQ } from './rq/TiplistRQ';

/**
 * Entity API
 * Follow com.etsoo.CoreFramework.Services.EntityServiceBase
 */
export class EntityApi<T extends IApp = IApp> extends BaseApi<T> {
    /**
     * Constructor
     * @param flag Identity flag, like 'Product' for product APIs
     * @param app Application
     */
    constructor(protected flag: string, app: T, api?: IApi) {
        super(app, api);
    }

    /**
     * Create
     * @param data Modal data
     * @param payload Payload
     * @returns Result
     */
    protected createBase<R extends IActionResult>(
        data: object,
        payload?: IApiPayload<R>
    ) {
        return this.api.put(`${this.flag}/Create`, data, payload);
    }

    /**
     * Delete
     * @param id Id or ids
     * @param payload Payload
     */
    protected deleteBase<R extends IActionResult>(
        id: DataTypes.IdType,
        payload?: IApiPayload<R>
    ): Promise<R | undefined>;
    protected deleteBase<R extends IActionResult>(
        ids: DataTypes.IdType[],
        payload?: IApiPayload<R>
    ): Promise<R | undefined>;
    protected deleteBase<R extends IActionResult>(
        id: DataTypes.IdType | DataTypes.IdType[],
        payload?: IApiPayload<R>
    ) {
        const query = Array.isArray(id)
            ? '?' + id.map((item) => `ids=${item}`).join('&')
            : id;
        return this.api.delete(
            `${this.flag}/Delete/${query}`,
            undefined,
            payload
        );
    }

    /**
     * List
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    protected listBase<
        T extends DataTypes.IdType,
        RQ extends TiplistRQ<T>,
        R extends object
    >(rq: RQ, payload?: IApiPayload<R[]>) {
        return this.api.post(`${this.flag}/List`, rq, payload);
    }

    /**
     * Query
     * @param rq Request data
     * @param payload Payload
     * @param queryKey Additional query key
     * @returns Result
     */
    protected queryBase<
        T extends DataTypes.IdType,
        RQ extends QueryRQ<T>,
        R extends object
    >(rq: RQ, payload?: IApiPayload<R[]>, queryKey: string = '') {
        return this.api.post(`${this.flag}/Query${queryKey}`, rq, payload);
    }

    /**
     * Query audit history
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    protected queryAuditBase<T extends DataTypes.IdType, R extends QueryRQ<T>>(
        rq: R,
        payload?: AuditLinePayload
    ) {
        return this.api.post(`${this.flag}/QueryAudit`, rq, payload);
    }

    /**
     * Query favored country ids
     * @returns Result
     */
    protected async queryFavoredCountryIdsBase(api?: string) {
        api ??= `${this.flag}/QueryFavoredCountryIds`;
        const result = await this.api.get<{ id: string }[]>(api, undefined, {
            showLoading: false
        });
        if (result == null) return [];
        return result.map((item) => item.id);
    }

    /**
     * Read
     * @param id Id
     * @param payload Payload
     * @returns Result
     */
    protected readBase<R extends object>(
        id: DataTypes.IdType,
        payload?: IApiPayload<R>
    ) {
        return this.api.get(`${this.flag}/Read/${id}`, undefined, payload);
    }

    /**
     * Sort
     * @param items Items to sort
     * @param payload Payload
     * @returns Result
     */
    protected sortBase<RQ extends { id: DataTypes.IdType }>(
        items: RQ[],
        payload?: IApiPayload<number>
    ) {
        const rq: Record<DataTypes.IdType, number> = {};
        items.forEach((item, index) => (rq[item.id] = index));
        return this.api.put(`${this.flag}/Sort`, rq, payload);
    }

    /**
     * Update
     * @param data Modal data
     * @param payload Payload
     * @returns Result
     */
    protected updateBase<R extends IActionResult>(
        data: object,
        payload?: IApiPayload<R>
    ) {
        return this.api.put(`${this.flag}/Update`, data, payload);
    }

    /**
     * Read for update
     * @param id Id
     * @param payload Payload
     * @returns Result
     */
    protected updateReadBase<R extends object>(
        id: DataTypes.IdType,
        payload?: IApiPayload<R>
    ) {
        return this.api.get(
            `${this.flag}/UpdateRead/${id}`,
            undefined,
            payload
        );
    }
}
