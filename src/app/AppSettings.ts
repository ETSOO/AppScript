import { DataTypes } from '@etsoo/shared';
import { IExternalSettings } from './ExternalSettings';

/**
 * API settings interface
 */
export interface IAppSettings extends IExternalSettings {
    /**
     * Supported languages
     */
    readonly languages: DataTypes.LanguageDefinition[];

    /**
     * Detected language
     */
    readonly detectedLanguage: string;

    /**
     * Current language
     */
    currentLanguage: DataTypes.LanguageDefinition;
}
