import { INotifier } from '@etsoo/notificationbase';
import { IApi } from '@etsoo/restclient';
import { DataTypes, DomUtils } from '@etsoo/shared';
import { IAppSettings } from './AppSettings';

/**
 * Core application interface
 */
export interface ICoreApp<S extends IAppSettings, N> {
    /**
     * Settings
     */
    readonly settings: S;

    /**
     * API
     */
    readonly api: IApi;

    /**
     * Notifier
     */
    readonly notifier: INotifier<N>;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Change language
     * @param language New lnguage definition
     */
    changeLanguage(language: DataTypes.LanguageDefinition): void;

    /**
     * Get label
     * @param key Label key
     * @returns Label
     */
    getLabel(key: string): string | undefined;

    /**
     * Get setting
     * @param key Label key
     * @returns Setting
     */
    getSetting<T extends DataTypes.SimpleType>(key: string): T | undefined;

    /**
     * Transform URL
     * @param url URL
     * @returns Transformed url
     */
    transformUrl(url: string): string;
}

/**
 * Core application
 */
export abstract class CoreApp<S extends IAppSettings, N>
    implements ICoreApp<S, N> {
    /**
     * Settings
     */
    readonly settings: S;

    /**
     * API
     */
    readonly api: IApi;

    /**
     * Notifier
     */
    readonly notifier: INotifier<N>;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Protected constructor
     * @param settings Settings
     * @param api API
     * @param notifier Notifier
     */
    protected constructor(settings: S, api: IApi, notifier: INotifier<N>) {
        this.settings = settings;
        this.api = api;
        this.notifier = notifier;
    }

    /**
     * Change language
     * @param language New lnguage definition
     */
    changeLanguage(language: DataTypes.LanguageDefinition): void {
        DomUtils.saveLanguage(language.name);
        this.settings.currentLanguage = language;
    }

    /**
     * Get label
     * @param key Label key
     * @returns Label
     */
    getLabel(key: string) {
        var label = this.settings.currentLanguage.labels[key];
        if (label == null) return undefined;
        return label.toString();
    }

    /**
     * Get setting
     * @param key Label key
     * @returns Setting
     */
    getSetting<T extends DataTypes.SimpleType>(key: string): T | undefined {
        const value = this.settings.currentLanguage.labels[key];
        if (value == null) return undefined;
        return value as T;
    }

    /**
     * Transform URL
     * @param url URL
     * @returns Transformed url
     */
    transformUrl(url: string) {
        // Home page for the router
        const home = this.settings.homepage;

        // Default, just leave it
        if (home === '') return url;

        // From relative root, like home:/react/, url: /about => /react/about
        if (url.startsWith('/')) return home + url.substr(1);

        const pathname = window.location.pathname;

        // Relative
        const pos = pathname.indexOf(home);
        if (pos == -1) return url;

        // To /a/b/../ => /a
        return pathname.endsWith('/') ? pathname + url : pathname + '/' + url;
    }
}
