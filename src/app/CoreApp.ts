import { INotifier } from '@etsoo/notificationbase';
import { IApi, IPData } from '@etsoo/restclient';
import { DataTypes, DomUtils } from '@etsoo/shared';
import { IAppSettings } from './AppSettings';

/**
 * Detect IP callback interface
 */
export interface IDetectIPCallback {
    (): void;
}

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
     * Culture
     */
    readonly culture: string | undefined;

    /**
     * IP data
     */
    ipData?: IPData;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Change country by id
     * @param countryId New country id
     */
    changeCountryId(countryId: string): void;

    /**
     * Change country
     * @param country New country definition
     */
    changeCountry(country: DataTypes.Country): void;

    /**
     * Change culture
     * @param culture New culture definition
     */
    changeCulture(culture: DataTypes.CultureDefinition): void;

    /**
     * Detect IP data, call only one time
     * @param callback Callback will be called when the IP is ready
     */
    detectIP(callback?: IDetectIPCallback): void;

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
    implements ICoreApp<S, N>
{
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

    private _culture?: string;

    /**
     * Culture
     */
    get culture() {
        return this._culture;
    }

    /**
     * IP data
     */
    ipData?: IPData;

    // IP detect ready callbacks
    private ipDetectCallbacks?: IDetectIPCallback[];

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
     * Change country by id
     * @param countryId New country id
     */
    changeCountryId(countryId: string) {
        var country = this.settings.countries.find((c) => c.id === countryId);
        if (country == null) return;

        this.changeCountry(country);
    }

    /**
     * Change country
     * @param country New country definition
     */
    changeCountry(country: DataTypes.Country) {
        // Id
        const { id } = country;

        // Same?
        if (id === this.settings.currentCountry?.id) return;

        // Save the id to local storage
        DomUtils.saveCountry(id);

        // Hold the current country
        this.settings.currentCountry = country;
    }

    /**
     * Change culture
     * @param culture New culture definition
     */
    changeCulture(culture: DataTypes.CultureDefinition) {
        // Name
        const { name } = culture;

        // Save the cultrue to local storage
        DomUtils.saveCulture(name);

        // Change the API's Content-Language header
        // .net 5 API, UseRequestLocalization, RequestCultureProviders, ContentLanguageHeaderRequestCultureProvider
        this.api.setContentLanguage(name);

        // Set the culture
        this._culture = name;

        // Hold the current resources
        this.settings.currentCulture = culture;

        // Update countries' names
        this.settings.countries.forEach(
            (c) => (c.name = this.get<string>('country' + c.id))
        );
    }

    /**
     * Detect IP data, call only one time
     * @param callback Callback will be called when the IP is ready
     */
    detectIP(callback?: IDetectIPCallback) {
        if (this.ipData != null) {
            if (callback != null) callback();
            return;
        }

        // First time
        if (this.ipDetectCallbacks == null) {
            // Init
            this.ipDetectCallbacks = [];

            // Call the API
            this.api.detectIP().then(
                (data) => {
                    if (data != null) {
                        // Hold the data
                        this.ipData = data;
                    }

                    this.detectIPCallbacks();
                },
                (_reason) => this.detectIPCallbacks()
            );
        }

        if (callback != null) {
            // Push the callback to the collection
            this.ipDetectCallbacks.push(callback);
        }
    }

    // Detect IP callbacks
    private detectIPCallbacks() {
        this.ipDetectCallbacks?.forEach((f) => f());
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
