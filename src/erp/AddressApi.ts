import { DataTypes } from '@etsoo/shared';
import { AddressContinent } from '../address/AddressContinent';
import { AddressRegion, AddressRegionDb } from '../address/AddressRegion';
import { AddressState } from '../address/AddressState';
import { IApp } from '../app/IApp';
import { IdLabelConditional } from '../dto/IdLabelDto';

/**
 * Address Api
 */
export class AddressApi {
    private languageLabels: Record<string, DataTypes.StringRecord | undefined> =
        {};

    /**
     * Constructor
     * @param app Application
     */
    constructor(private app: IApp) {}

    /**
     * Get address labels
     * @param language Language
     * @returns Result
     */
    async getLabels(language?: string) {
        const l = this.app.checkLanguage(language);
        let labels = this.languageLabels[l];
        if (labels == null) {
            labels = await import(`./../i18n/address.${l}.json`);

            // Cache
            this.languageLabels[l] = labels;
        }
        return labels!;
    }

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
        const labels = await this.getLabels(language);
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
            const labels = await this.getLabels(language);
            return AddressRegion.all.map((region) => {
                region.label = labels['region' + region.id] as string;
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
