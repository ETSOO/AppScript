import { DataTypes } from '@etsoo/shared';
import { AddressRegion } from './AddressRegion';

const languageLabels: Record<string, DataTypes.StringRecord | undefined> = {};

/**
 * Address utils
 */
export namespace AddressUtils {
    /**
     * Get address labels
     * @param language Language
     * @returns Result
     */
    export async function getLabels(language: string) {
        let labels = languageLabels[language];
        if (labels == null) {
            labels = await import(`./../i18n/address.${language}.json`);

            // Cache
            languageLabels[language] = labels;
        }
        return labels!;
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
     * @param id Region id
     * @param labels Labels
     * @returns Label
     */
    export function getRegionLabel(
        id: string,
        labels: DataTypes.StringRecord
    ): string {
        return (labels['region' + id] as string) ?? id;
    }

    /**
     * Update region label
     * @param region Region
     * @param culture Culture
     */
    export async function updateRegionLabel(
        region: AddressRegion,
        culture: string
    ) {
        const labels = await AddressUtils.getLabels(culture);
        region.label = getRegionLabel(region.id, labels);
    }
}
