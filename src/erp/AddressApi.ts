import { DataTypes } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { IdLabelConditional } from './dto/IdLabelDto';
import { BaseApi } from './BaseApi';
import { IApiPayload } from '@etsoo/restclient';
import { RegionsRQ } from './rq/RegionsRQ';

const cachedRegions: { [P: string]: AddressRegionDb[] | undefined | null } = {};

/**
 * Address Api
 */
export class AddressApi extends BaseApi {
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
     * Get all regions
     * @param rq Rquest data
     */
    async getRegions(rq?: RegionsRQ): Promise<AddressRegionDb[] | undefined> {
        const culture = this.app.culture;
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
                    region.label.includes(keyword) || region.id === keyword
            );

        // Order by favoredIds
        if (favoredIds.length > 0) {
            regions = [...regions].sort((r1, r2) => {
                const n1 = favoredIds.indexOf(r1.id);
                const n2 = favoredIds.indexOf(r2.id);

                if (n1 === n2) return 0;
                if (n1 === -1) return 1;
                if (n2 === -1) return -1;
                return n1 - n2;
            });
        }

        // Return the top items
        return regions.slice(0, items);
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
     * @param payload Payload
     * @returns Result
     */
    states(regionId: string, payload?: IApiPayload<AddressState[]>) {
        payload ??= { defaultValue: [], showLoading: false };

        return this.api.get(
            `Address/StateList?regionId=${regionId}&language=${this.app.culture}`,
            undefined,
            payload
        );
    }
}
