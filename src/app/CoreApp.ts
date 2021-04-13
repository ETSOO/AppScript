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
     * Change culture
     * @param culture New culture definition
     */
    changeCulture(culture: DataTypes.CultureDefinition): void;

    /**
     * Get culture resource
     * @param key key
     * @returns Resource
     */
    get<T extends DataTypes.SimpleType = string>(key: string): T | undefined;

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
        // onRequest, show loading or not, rewrite the property to override default action
        api.onRequest = (data) => {
            if (data.showLoading == null || data.showLoading) {
                notifier.showLoading();
            }
        };

        // onComplete, hide loading, rewrite the property to override default action
        api.onComplete = (data) => {
            if (data.showLoading == null || data.showLoading) {
                notifier.hideLoading();
            }
        };

        this.settings = settings;
        this.api = api;
        this.notifier = notifier;
    }

    /**
     * Change culture
     * @param culture New culture definition
     */
    changeCulture(culture: DataTypes.CultureDefinition) {
        // Save the cultrue to local storage
        DomUtils.saveCulture(culture.name);

        // Change the API's Content-Language header
        // .net 5 API, UseRequestLocalization, ApplyCurrentCultureToResponseHeaders
        this.api.setContentLanguage(culture.name);

        // Hold the current resources
        this.settings.currentCulture = culture;
    }

    /**
     * Get culture resource
     * @param key key
     * @returns Resource
     */
    get<T extends DataTypes.SimpleType = string>(key: string): T | undefined {
        const value = this.settings.currentCulture.resources[key];
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
