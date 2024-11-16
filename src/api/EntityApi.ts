import { IApi, IApiPayload } from '@etsoo/restclient';
import { IActionResult, IdType } from '@etsoo/shared';
import { IApp } from '../app/IApp';
import { BaseApi } from './BaseApi';
import { ResultPayload } from './dto/ResultPayload';
import { MergeRQ } from './rq/MergeRQ';
import { QueryRQ } from './rq/QueryRQ';
import { UpdateStatusRQ } from './rq/UpdateStatusRQ';
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
        id: IdType,
        payload?: IApiPayload<R>
    ): Promise<R | undefined>;
    protected deleteBase<R extends IActionResult>(
        ids: IdType[],
        payload?: IApiPayload<R>
    ): Promise<R | undefined>;
    protected deleteBase<R extends IActionResult>(
        id: IdType | IdType[],
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
        T extends IdType,
        RQ extends QueryRQ<T>,
        R extends object
    >(rq: RQ, payload?: IApiPayload<R[]>) {
        let { queryPaging, ...rest } = rq;
        if (typeof queryPaging === 'number') {
            queryPaging = { currentPage: 0, batchSize: queryPaging };
        }
        return this.api.post(
            `${this.flag}/List`,
            { queryPaging, ...rest },
            payload
        );
    }

    /**
     * Merge
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    protected mergeBase<T extends IdType = number>(
        rq: MergeRQ<T>,
        payload?: ResultPayload
    ) {
        return this.api.put(`${this.flag}/Merge`, rq, payload);
    }

    /**
     * Query
     * @param rq Request data
     * @param payload Payload
     * @param queryKey Additional query key
     * @returns Result
     */
    protected queryBase<
        T extends IdType,
        RQ extends QueryRQ<T>,
        R extends object
    >(rq: RQ, payload?: IApiPayload<R[]>, queryKey: string = '') {
        return this.api.post(`${this.flag}/Query${queryKey}`, rq, payload);
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
    protected readBase<R extends object>(id: IdType, payload?: IApiPayload<R>) {
        return this.api.get(`${this.flag}/Read/${id}`, undefined, payload);
    }

    /**
     * Sort
     * @param items Items to sort
     * @param payload Payload
     * @returns Result
     */
    protected sortBase<RQ extends { id: IdType }>(
        items: RQ[],
        payload?: IApiPayload<number>
    ) {
        const rq: Record<IdType, number> = {};
        items.forEach((item, index) => (rq[item.id] = index));
        return this.api.put(`${this.flag}/Sort`, rq, payload);
    }

    /**
     * Sort with category
     * @param category Category for grouping
     * @param items Items to sort
     * @param method Sort method
     * @param payload Payload
     * @returns Result
     */
    protected sortWith<RQ extends { id: IdType }>(
        category: number,
        items: RQ[],
        method: string = 'Sort',
        payload?: IApiPayload<number>
    ) {
        const data: Record<IdType, number> = {};
        items.forEach((item, index) => (data[item.id] = index));
        return this.api.put(
            `${this.flag}/${method}`,
            { category, data },
            payload
        );
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
        id: IdType,
        payload?: IApiPayload<R>
    ) {
        return this.api.get(
            `${this.flag}/UpdateRead/${id}`,
            undefined,
            payload
        );
    }

    /**
     * Update status
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    protected updateStatusBase(rq: UpdateStatusRQ, payload?: ResultPayload) {
        return this.api.put(`${this.flag}/UpdateStatus`, rq, payload);
    }
}
