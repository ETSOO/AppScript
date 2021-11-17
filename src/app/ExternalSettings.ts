/**
 * External settings items
 */
export interface IExternalSettings {
    /**
     * API endpoint
     */
    readonly endpoint: string;

    /**
     * App root url
     */
    readonly homepage: string;

    /**
     * Cloud web url
     */
    readonly webUrl: string;

    /**
     * Core system Url
     */
    readonly coreUrl?: string;

    /**
     * Core system API
     */
    readonly coreApi?: string;
}

/**
 * External settings host
 * Usually passed by window global settings property
 */
export interface IExternalSettingsHost {
    /**
     * Configurable API settings
     */
    readonly settings: IExternalSettings;
}
