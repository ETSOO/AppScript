import { ApiAuthorizationScheme } from '@etsoo/restclient';
import { DataTypes } from '@etsoo/shared';
import { IExternalSettings } from './ExternalSettings';

/**
 * API settings interface
 */
export interface IAppSettings extends IExternalSettings {
    /**
     * Authorization scheme
     */
    readonly authScheme: ApiAuthorizationScheme | string;

    /**
     * Supported countries
     */
    readonly countries: DataTypes.Country[];

    /**
     * Supported cultures
     */
    readonly cultures: DataTypes.CultureDefinition[];

    /**
     * Detected culture
     */
    readonly detectedCulture: string;

    /**
     * Time zone
     */
    readonly timeZone?: string;

    /**
     * Current country
     */
    currentCountry: DataTypes.Country;

    /**
     * Current culture
     */
    currentCulture: DataTypes.CultureDefinition;
}
