import { DataTypes } from '@etsoo/shared';
import { IExternalSettings } from './ExternalSettings';

/**
 * API settings interface
 */
export interface IAppSettings extends IExternalSettings {
    /**
     * Supported cultures
     */
    readonly cultures: DataTypes.CultureDefinition[];

    /**
     * Detected culture
     */
    readonly detectedCulture: string;

    /**
     * Current culture
     */
    currentCulture: DataTypes.CultureDefinition;
}
