import { DataTypes } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { AddressUtils } from '../address/AddressUtils';
import { IdLabelConditional } from '../dto/IdLabelDto';
import { BaseApi } from './BaseApi';

/**
 * Address Api
 */
export class AddressApi extends BaseApi {
    /**
     * Get all continents
     * @param language Language
     * @param isNumberKey Is number key or key as id
     * @returns Continents
     */
    async continents<T extends boolean>(
        language?: string,
        isNumberKey = <T>false
    ): Promise<IdLabelConditional<T>> {
        const labels = await AddressUtils.getLabels(
            this.app.checkLanguage(language)
        );
        return <IdLabelConditional<T>>DataTypes.getEnumKeys(
            AddressContinent
        ).map((key) => ({
            id: isNumberKey
                ? <number>DataTypes.getEnumByKey(AddressContinent, key)!
                : key.toString(),
            label: labels['continent' + key] ?? key
        }));
    }

    /**
     * Get region list from database
     * @param language Language
     * @param isLocal Is local version
     * @returns Result
     */
    async regions<T extends boolean = true>(
        language?: string,
        isLocal?: T
    ): Promise<
        T extends true | undefined
            ? AddressRegion[]
            : AddressRegionDb[] | undefined
    > {
        language = this.app.checkLanguage(language);
        if (isLocal == null || isLocal) {
            const labels = await AddressUtils.getLabels(language);
            return AddressRegion.all.map((region) => {
                region.label = AddressUtils.getRegionLabel(region.id, labels);
                return { ...region };
            });
        } else {
            return (await this.app.api.get<AddressRegionDb[]>(
                `Address/RegionList?language=${language}`,
                undefined,
                { defaultValue: [] }
            )) as any;
        }
    }

    /**
     * Get state list from database
     * @param regionId Region id
     * @param language Language
     * @returns Result
     */
    states(regionId: string, language?: string) {
        language = this.app.checkLanguage(language);
        return this.app.api.get<AddressState[]>(
            `Address/StateList?regionId=${regionId}&language=${language}`,
            undefined,
            { defaultValue: [] }
        );
    }
}
