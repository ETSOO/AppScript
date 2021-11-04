import { DataTypes } from '@etsoo/shared';
import { AddressRegion } from '..';
import { IdLabelConditional } from '../dto/IdLabelDto';
import { ICultureGet } from '../state/Culture';
import { AddressContinent } from './AddressContinent';

/**
 * Address utils
 */
export namespace AddressUtils {
    /**
     * Get all continents
     * @param func Label delegate
     * @param isNumberKey Is number key or key as id
     * @returns Continents
     */
    export function getContinents<T extends boolean>(
        func: ICultureGet,
        isNumberKey = <T>false
    ): IdLabelConditional<T> {
        return <IdLabelConditional<T>>DataTypes.getEnumKeys(
            AddressContinent
        ).map((key) => ({
            id: isNumberKey
                ? <number>DataTypes.getEnumByKey(AddressContinent, key)!
                : key.toString(),
            label: func('continent' + key) ?? key
        }));
    }

    /**
     * Get region from regions and detected region and language
     * @param regions Supported regions
     * @param detectedRegion Detected region
     * @param detectedLanguage Detected language
     */
    export function getRegion(
        regions: string[],
        detectedRegion?: string | null,
        detectedLanguage?: string | null
    ): AddressRegion {
        // Exactly match
        if (detectedRegion && regions.includes(detectedRegion)) {
            const region = AddressRegion.getById(detectedRegion);
            if (region) return region;
        }

        // Match with language
        if (detectedLanguage) {
            const region = regions
                .map((id) => AddressRegion.getById(id)!)
                .find((item) => item.languages.includes(detectedLanguage));
            if (region) region;
        }

        // Default
        return AddressRegion.getById(regions[0])!;
    }

    /**
     * Get region label
     * @param region Region id
     * @param func Label delegate
     * @returns Label
     */
    export function getRegionLabel(region: string, func: ICultureGet) {
        return func('region' + region) ?? region;
    }
}
