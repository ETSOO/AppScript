import { DataTypes } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { IdLabelConditional } from './dto/IdLabelDto';
import { BaseApi } from './BaseApi';

/**
 * Address Api
 */
export class AddressApi extends BaseApi {
    /**
     * Get all continents
     * @param isNumberKey Is number key or key as id
     * @returns Continents
     */
    async continents<T extends boolean>(
        isNumberKey = <T>false
    ): Promise<IdLabelConditional<T>> {
        return <IdLabelConditional<T>>DataTypes.getEnumKeys(
            AddressContinent
        ).map((key) => ({
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
     * Get region list
     * @param isLocal Is local version
     * @returns Result
     */
    async regions<T extends boolean = true>(
        isLocal?: T
    ): Promise<
        T extends true | undefined
            ? AddressRegion[]
            : AddressRegionDb[] | undefined
    > {
        if (isLocal == null || isLocal) {
            return AddressRegion.all.map((region) => {
                region.label = this.app.getRegionLabel(region.id);
                return { ...region };
            });
        } else {
            return (await this.api.get<AddressRegionDb[]>(
                `Address/RegionList?language=${this.app.culture}`,
                undefined,
                { defaultValue: [] }
            )) as any;
        }
    }

    /**
     * Get state list
     * @param regionId Region id
     * @returns Result
     */
    states(regionId: string) {
        return this.api.get<AddressState[]>(
            `Address/StateList?regionId=${regionId}&language=${this.app.culture}`,
            undefined,
            { defaultValue: [] }
        );
    }
}
