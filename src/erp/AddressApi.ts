import { DataTypes, Utils } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { IdLabelConditional } from './dto/IdLabelDto';
import { BaseApi } from './BaseApi';
import { IApiPayload } from '@etsoo/restclient';
import { RegionsRQ } from './rq/RegionsRQ';
import { AddressCity } from '../address/AddressCity';
import { AddressDistrict } from '../address/AddressDistrict';
import { PlaceQueryRQ } from './rq/PlaceQueryRQ';
import { AddressAutocomplete } from '../address/AddressAutocomplete';
import { AddressPlace } from '../address/AddressPlace';

const cachedRegions: { [P: string]: AddressRegionDb[] | undefined | null } = {};

/**
 * Address Api
 */
export class AddressApi extends BaseApi {
    /**
     * Place autocomplete
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    autocomplete(
        rq: PlaceQueryRQ,
        payload?: IApiPayload<AddressAutocomplete[]>
    ) {
        return this.api.post('Address/Autocomplete', rq, payload);
    }

    /**
     * Get all continents
     * @param isNumberKey Is number key or key as id
     * @param includeAntarctica Include Antarctica or not
     * @returns Continents
     */
    continents<T extends boolean>(
        isNumberKey = <T>false,
        includeAntarctica: boolean = false
    ): IdLabelConditional<T> {
        return <IdLabelConditional<T>>DataTypes.getEnumKeys(AddressContinent)
            .filter((item) => includeAntarctica || item !== 'AN')
            .map((key) => ({
                id: isNumberKey
                    ? <number>DataTypes.getEnumByKey(AddressContinent, key)!
                    : key.toString(),
                label: this.getContinentLabel(key)
            }));
    }

    /**
     * Get continent label
     * @param id Region id
     * @returns Label
     */
    getContinentLabel(id: AddressContinent | string) {
        return this.app.get('continent' + id) ?? (id as string);
    }

    /**
     * Get region by id
     * @param id Region id
     * @returns Result
     */
    async getRegion(id?: string) {
        if (!id) return this.app.defaultRegion;
        const regions = await this.getRegions({ id });
        if (regions == null || regions.length === 0) return undefined;
        return regions[0];
    }

    /**
     * Get region label
     * @param id Region id
     * @returns Label
     */
    getRegionLabel(id: string) {
        // Local defined region label
        let label = this.app.getRegionLabel(id);
        if (label === id) {
            // Cache data, make sure called getRegions first
            const regions = cachedRegions[this.app.culture];
            const region = regions?.find((region) => region.id === id);
            if (region) return region.label;
        }
        return label;
    }

    /**
     * Get all regions
     * @param rq Rquest data
     */
    async getRegions(rq?: RegionsRQ): Promise<AddressRegionDb[] | undefined> {
        const culture = rq?.culture ?? this.app.culture;
        let regions = cachedRegions[culture];
        if (regions == null) {
            regions = await this.api.get<AddressRegionDb[]>(
                `Address/RegionList?language=${culture}`,
                undefined,
                { defaultValue: [], showLoading: false }
            );
            if (regions == null) return undefined;
            cachedRegions[culture] = regions;
        }

        const { id, favoredIds = [], items = 8, keyword } = rq ?? {};

        // Id first
        if (id) {
            return regions.filter((region) => region.id === id);
        }

        // Keyword filter
        if (keyword)
            regions = regions.filter(
                (region) =>
                    region.label.includes(keyword) ||
                    region.py?.includes(keyword.toUpperCase()) ||
                    region.id === keyword.toUpperCase()
            );

        // Order by favoredIds
        if (favoredIds.length > 0) {
            regions = Utils.sortByFieldFavor([...regions], 'id', favoredIds);
        }

        // Return the top items
        return regions.slice(0, items);
    }

    /**
     * Get region's currency, current region's currency as default
     * @param regionId Region id
     * @returns Result
     */
    regionCurrency(regionId?: string) {
        const region =
            (regionId
                ? this.regions().find((region) => region.id === regionId)
                : null) ?? this.app.settings.currentRegion;
        return region.currency;
    }

    /**
     * Get local region by id
     * @param id Region id
     * @returns Result
     */
    region(id?: string) {
        if (!id) return this.app.defaultRegion;
        return this.regions().find((region) => region.id === id);
    }

    /**
     * Get all local regions
     */
    regions(): AddressRegion[];

    /**
     * Get all local regions limited to favored ids
     * @param favoredIds Favored ids
     */
    regions(favoredIds: string[]): AddressRegion[];

    regions(p?: string[]) {
        const items =
            p == null || p.length === 0
                ? AddressRegion.all
                : AddressRegion.all.filter((ad) => p.includes(ad.id));
        return items.map((region) => ({
            ...region,
            label: this.app.getRegionLabel(region.id)
        }));
    }

    /**
     * Get state list
     * @param regionId Region id
     * @param favoredIds Favored ids
     * @param payload Payload
     * @param culture Culture
     * @returns Result
     */
    async states(
        regionId: string,
        favoredIds: string[] = [],
        payload?: IApiPayload<AddressState[]>,
        culture?: string
    ) {
        payload ??= { defaultValue: [], showLoading: false };
        culture ??= this.app.culture;

        var items = await this.api.get(
            `Address/StateList?regionId=${regionId}&language=${culture}`,
            undefined,
            payload
        );

        if (items == null || favoredIds.length === 0) return items;
        return Utils.sortByFieldFavor(items, 'id', favoredIds);
    }

    /**
     * Get city list
     * @param stateId State id
     * @param favoredIds Favored ids
     * @param payload Payload
     * @param culture Culture
     *
     * @returns Result
     */
    async cities(
        stateId: string,
        favoredIds: number[] = [],
        payload?: IApiPayload<AddressCity[]>,
        culture?: string
    ) {
        payload ??= { defaultValue: [], showLoading: false };
        culture ??= this.app.culture;

        const items = await this.api.get(
            `Address/CityList?stateId=${stateId}&language=${culture}`,
            undefined,
            payload
        );

        if (items == null || favoredIds.length === 0) return items;
        return Utils.sortByFieldFavor(items, 'id', favoredIds);
    }

    /**
     * Get district list
     * @param cityId City id
     * @param favoredIds Favored ids
     * @param payload Payload
     * @param culture Culture
     * @returns Result
     */
    async districts(
        cityId: number,
        favoredIds: number[] = [],
        payload?: IApiPayload<AddressDistrict[]>,
        culture?: string
    ) {
        payload ??= { defaultValue: [], showLoading: false };
        culture ??= this.app.culture;

        const items = await this.api.get(
            `Address/DistrictList?cityId=${cityId}&language=${culture}`,
            undefined,
            payload
        );

        if (items == null || favoredIds.length === 0) return items;
        return Utils.sortByFieldFavor(items, 'id', favoredIds);
    }

    /**
     * Get place details
     * @param placeId Place id
     * @param language Language
     * @param payload Payload
     * @returns Result
     */
    GetPlaceDetails(
        placeId: string,
        language?: string,
        payload?: IApiPayload<AddressPlace>
    ) {
        const url = `Address/GetPlaceDetails/${placeId}/${
            language == null ? '' : language
        }`;
        return this.api.get(url, undefined, payload);
    }

    /**
     * Place autocomplete
     * @param rq Request data
     * @param payload Payload
     * @returns Result
     */
    searchPlace(rq: PlaceQueryRQ, payload?: IApiPayload<AddressPlace[]>) {
        return this.api.post('Address/SearchPlace', rq, payload);
    }
}
