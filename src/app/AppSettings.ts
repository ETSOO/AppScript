import { ApiAuthorizationScheme } from '@etsoo/restclient';
import { DataTypes } from '@etsoo/shared';
import { AddressRegion } from '../address/AddressRegion';
import { IExternalSettings } from './ExternalSettings';

/**
 * App settings interface
 */
export interface IAppSettings extends IExternalSettings {
    /**
     * Authorization scheme
     */
    readonly authScheme: ApiAuthorizationScheme | string;

    /**
     * Supported country/region ids
     */
    readonly regions: string[];

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
    timeZone?: string;

    /**
     * Current country or region
     */
    currentRegion: AddressRegion;

    /**
     * Current culture
     */
    currentCulture: DataTypes.CultureDefinition;
}
