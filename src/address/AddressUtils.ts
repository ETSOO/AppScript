import { AddressRegion } from './AddressRegion';

/**
 * Address utils
 */
export namespace AddressUtils {
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
}
