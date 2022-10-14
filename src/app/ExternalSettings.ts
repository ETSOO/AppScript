/**
 * External settings items
 */
export interface IExternalSettings {
    /**
     * Core system API endpoint
     */
    readonly endpoint: string;

    /**
     * Core system app root url
     */
    readonly homepage: string;

    /**
     * Core system web url
     */
    readonly webUrl: string;

    /**
     * Service API endpoint
     */
    readonly serviceEndpoint?: string;

    /**
     * Service web Url
     */
    readonly serviceUrl?: string;
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
                    // Host name
                    const hostname = globalThis.location.hostname;

                    // replace {hostname}
                    format(settings, hostname);
                }

                return settings as IExternalSettings;
            }
        }
        return undefined;
    }

    export function format(settings: any, hostname?: string) {
        // Default hostname
        if (!hostname) hostname = 'localhost';

        // replace {hostname}
        for (const key in settings) {
            const value = settings[key];
            if (typeof value === 'string') {
                settings[key] = value.replace('{hostname}', hostname);
            }
        }

        return settings;
    }
}
