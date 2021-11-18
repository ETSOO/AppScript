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
 * External settings namespace
 */
export namespace ExternalSettings {
    /**
     * Create instance
     */
    export function Create(): IExternalSettings | undefined {
        if ('settings' in globalThis) {
            const settings = Reflect.get(globalThis, 'settings');
            if (typeof settings === 'object') {
                if (typeof window !== 'undefined') {
                    const hostname = window.location.hostname;
                    // replace {hostname}
                    for (const key in settings) {
                        const value = settings[key];
                        if (typeof value === 'string') {
                            settings[key] = value.replace(
                                '{hostname}',
                                hostname
                            );
                        }
                    }
                }

                return settings as IExternalSettings;
            }
        }
        return undefined;
    }
}
