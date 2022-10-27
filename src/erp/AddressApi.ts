import { DataTypes } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { IdLabelConditional } from './dto/IdLabelDto';
import { BaseApi } from './BaseApi';
import { IApiPayload } from '@etsoo/restclient';

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

    regions(isRemote: true): Promise<AddressRegionDb[] | undefined>;
    regions(): AddressRegion[];

    /**
     * Get region list
     * @param isRemote Is Remote version
     * @returns Result
     */
    regions(isRemote?: boolean) {
        if (isRemote) {
            return this.api.get<AddressRegionDb[]>(
                `Address/RegionList?language=${this.app.culture}`,
                undefined,
                { defaultValue: [], showLoading: false }
            );
        } else {
            return AddressRegion.all.map((region) => {
                region.label = this.app.getRegionLabel(region.id);
                return { ...region };
            });
        }
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
