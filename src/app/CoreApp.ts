import { INotifier } from '@etsoo/notificationbase';
import { ApiDataError, IApi, IPData } from '@etsoo/restclient';
import { DataTypes, DateUtils, DomUtils, StorageUtils } from '@etsoo/shared';
import { ActionResultError } from '../result/ActionResultError';
import { IActionResult } from '../result/IActionResult';
import { IUserData } from '../state/User';
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
     * User data
     */
    userData?: IUserData;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Alert action result
     * @param result Action result
     */
    alertResult(result: IActionResult): void;

    /**
     * Authorize
     * @param token New token
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    authorize(token?: string, refreshToken?: string, keep?: boolean): void;

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
     * Format date to string
     * @param input Input date
     * @param options Options
     * @param timeZone Time zone
     * @returns string
     */
    formatDate(
        input?: Date | string,
        options?: DateUtils.FormatOptions,
        timeZone?: string
    ): string | undefined;

    /**
     * Get culture resource
     * @param key key
     * @returns Resource
     */
    get<T extends DataTypes.SimpleType = string>(key: string): T | undefined;

    /**
     * Get multiple culture labels
     * @param keys Keys
     */
    getLables<T extends string>(...keys: T[]): { [K in T]: string };

    /**
     * Get cached token
     * @returns Cached token
     */
    getCacheToken(): string | null;

    /**
     * Get refresh token from response headers
     * @param rawResponse Raw response from API call
     * @returns response refresh token
     */
    getResponseToken(rawResponse: any): string | null;

    /**
     * Callback where exit a page
     */
    pageExit(): void;

    /**
     * Transform URL
     * @param url URL
     * @returns Transformed url
     */
    transformUrl(url: string): string;

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLogin(user: IUserData, refreshToken?: string, keep?: boolean): void;

    /**
     * User logout
     */
    userLogout(): void;
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

    /**
     * User data
     */
    userData?: IUserData;

    /**
     * Response token header field name
     */
    headerTokenField = 'SmartERPRefreshToken';

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

        // Global API error handler
        api.onError = (error: ApiDataError) => {
            // Error code
            const status = error.response
                ? api.transformResponse(error.response).status
                : undefined;

            if (status === 401) {
                // When status is equal to 401, unauthorized, try login
                this.tryLogin();
            } else {
                // Report the error
                notifier.alert(this.formatError(error));
            }
        };

        this.settings = settings;
        this.api = api;
        this.notifier = notifier;

        // Setup callback
        this.setup();
    }

    /**
     * Alert action result
     * @param result Action result
     */
    alertResult(result: IActionResult) {
        this.notifier.alert(ActionResultError.format(result));
    }

    /**
     * Authorize
     * @param token New token
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    authorize(token?: string, refreshToken?: string, keep: boolean = false) {
        this.api.authorize(this.settings.authScheme, token);

        // Cover the current value
        StorageUtils.setLocalData(
            this.headerTokenField,
            keep ? refreshToken : undefined
        );
        StorageUtils.setSessionData(
            this.headerTokenField,
            keep ? undefined : refreshToken
        );
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
        if (id === this.settings.currentCountry.id) return;

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
     * Format date to string
     * @param input Input date
     * @param options Options
     * @param timeZone Time zone
     * @returns string
     */
    formatDate(
        input?: Date | string,
        options?: DateUtils.FormatOptions,
        timeZone?: string
    ) {
        const { currentCulture, timeZone: defaultTimeZone } = this.settings;
        timeZone ??= defaultTimeZone;
        return DateUtils.format(currentCulture.name, input, options, timeZone);
    }

    /**
     * Format error
     * @param error Error
     * @returns Error message
     */
    formatError(error: ApiDataError) {
        return error.toString();
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
     * Get multiple culture labels
     * @param keys Keys
     */
    getLables<T extends string>(...keys: T[]): { [K in T]: string } {
        const init: any = {};
        return keys.reduce(
            (a, v) => ({ ...a, [v]: this.get<string>(v) ?? '' }),
            init
        );
    }

    /**
     * Get cached token
     * @returns Cached token
     */
    getCacheToken(): string | null {
        let refreshToken = StorageUtils.getLocalData(this.headerTokenField, '');
        if (refreshToken === '')
            refreshToken = StorageUtils.getSessionData(
                this.headerTokenField,
                ''
            );

        if (refreshToken === '') return null;

        return refreshToken;
    }

    /**
     * Get refresh token from response headers
     * @param rawResponse Raw response from API call
     * @returns response refresh token
     */
    getResponseToken(rawResponse: any): string | null {
        const response = this.api.transformResponse(rawResponse);
        return this.api.getHeaderValue(response.headers, this.headerTokenField);
    }

    /**
     * Callback where exit a page
     */
    pageExit() {}

    /**
     * Setup callback
     */
    setup() {}

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

    /**
     * Try login
     */
    abstract tryLogin(): void;

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLogin(user: IUserData, refreshToken?: string, keep?: boolean) {
        this.userData = user;
        this.authorize(user.token, refreshToken, keep);
    }

    /**
     * User logout
     */
    userLogout() {
        this.authorize(undefined, undefined);
    }
}
