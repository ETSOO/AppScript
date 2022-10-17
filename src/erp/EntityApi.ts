import { IApi, IApiPayload } from '@etsoo/restclient';
import { DataTypes } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { IActionResult } from '../result/IActionResult';
import { BaseApi } from './BaseApi';
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
        return this.api.put<R>(`${this.flag}/Create`, data, payload);
    }

    /**
     * Delete
     * @param id Id or ids
     * @param payload Payload
     */
    protected deleteBase<R extends IActionResult>(
        id: DataTypes.IdType,
        payload?: IApiPayload<R>
    ): R;
    protected deleteBase<R extends IActionResult>(
        ids: DataTypes.IdType[],
        payload?: IApiPayload<R>
    ): R;
    protected deleteBase<R extends IActionResult>(
        id: DataTypes.IdType | DataTypes.IdType[],
        payload?: IApiPayload<R>
    ) {
        const query = Array.isArray(id)
            ? '?' + id.map((item) => `ids=${item}`).join('&')
            : id;
        return this.api.delete<R>(
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
    protected listBase<RQ extends TiplistRQ, R extends object>(
        rq: RQ,
        payload?: IApiPayload<R[]>
    ) {
        return this.api.post<R[]>(`${this.flag}/List`, rq, payload);
    }

    /**
     * Query
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    protected queryBase<RQ extends QueryRQ, R extends object>(
        rq: RQ,
        payload?: IApiPayload<R[]>
    ) {
        return this.api.post<R[]>(`${this.flag}/Query`, rq, payload);
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
        return this.api.get<R>(`${this.flag}/Read/${id}`, payload);
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
        return this.api.put<number>(`${this.flag}/Sort`, rq, payload);
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
        return this.api.put<R>(`${this.flag}/Update`, data, payload);
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
        return this.api.get<R>(`${this.flag}/UpdateRead/${id}`, payload);
    }
}
