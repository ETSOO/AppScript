import {
    INotification,
    INotifier,
    NotificationAlign,
    NotificationCallProps,
    NotificationContent,
    NotificationMessageType
} from '@etsoo/notificationbase';
import { ApiDataError, IApi, IPData } from '@etsoo/restclient';
import {
    DataTypes,
    DateUtils,
    DomUtils,
    NumberUtils,
    StorageUtils
} from '@etsoo/shared';
import { AddressRegion } from '../address/AddressRegion';
import { AddressUtils } from '../address/AddressUtils';
import { ActionResultError } from '../result/ActionResultError';
import { IActionResult } from '../result/IActionResult';
import { IUserData } from '../state/User';
import { IAppSettings } from './AppSettings';
import { UserRole } from './UserRole';

/**
 * Detect IP callback interface
 */
export interface IDetectIPCallback {
    (): void;
}

/**
 * Refresh token result type
 * true means success, false means failed but no any message
 * other cases means failed with differnet message
 */
export type RefreshTokenResult =
    | boolean
    | string
    | ApiDataError
    | IActionResult;

/**
 * Refresh token props
 */
export interface RefreshTokenProps<D extends {}> {
    /**
     * Callback
     */
    callback?: (result: RefreshTokenResult) => void;

    /**
     * Data to pass
     */
    data?: D;

    /**
     * Show loading bar or not
     */
    showLoading?: boolean;
}

/**
 * Core application interface
 */
export interface ICoreApp<
    S extends IAppSettings,
    N,
    C extends NotificationCallProps
> {
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
    readonly notifier: INotifier<N, C>;

    /**
     * Label delegate
     */
    readonly labelDelegate: <T = string>(key: string) => T | undefined;

    /**
     * Culture, like zh-CN
     */
    readonly culture: string;

    /**
     * Currency, like USD for US dollar
     */
    readonly currency: string;

    /**
     * Country or region, like CN
     */
    readonly region: string;

    /**
     * Is current authorized
     */
    readonly authorized: boolean;

    /**
     * Application name
     */
    readonly name: string;

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
     * Change country or region
     * @param region New country or region
     */
    changeRegion(region: string | AddressRegion): void;

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
     * Format money number
     * @param input Input money number
     * @param isInteger Is integer
     * @param options Options
     * @returns Result
     */
    formatMoney(
        input?: number | bigint,
        isInteger?: boolean,
        options?: Intl.NumberFormatOptions
    ): string | undefined;

    /**
     * Format number
     * @param input Input number
     * @param options Options
     * @returns Result
     */
    formatNumber(
        input?: number | bigint,
        options?: Intl.NumberFormatOptions
    ): string | undefined;

    /**
     * Format result text
     * @param result Action result
     * @param forceToLocal Force to local labels
     */
    formatResult(result: IActionResult, forceToLocal?: boolean): void;

    /**
     * Fresh countdown UI
     * @param callback Callback
     */
    freshCountdownUI(callback?: () => PromiseLike<unknown>): void;

    /**
     * Get culture resource
     * @param key key
     * @returns Resource
     */
    get<T = string>(key: string): T | undefined;

    /**
     * Get multiple culture labels
     * @param keys Keys
     */
    getLabels<T extends string>(...keys: T[]): { [K in T]: string };

    /**
     * Get cached token
     * @returns Cached token
     */
    getCacheToken(): string | null;

    /**
     * Get all regions
     * @returns Regions
     */
    getRegions(): AddressRegion[];

    /**
     * Get refresh token from response headers
     * @param rawResponse Raw response from API call
     * @returns response refresh token
     */
    getResponseToken(rawResponse: any): string | null;

    /**
     * Get time zone
     * @returns Time zone
     */
    getTimeZone(): string | undefined;

    /**
     * Check use has the specific role permission or not
     * @param roles Roles to check
     * @returns Result
     */
    hasPermission(roles: number | UserRole | number[] | UserRole[]): boolean;

    /**
     * Callback where exit a page
     */
    pageExit(): void;

    /**
     * Refresh token
     * @param props Props
     */
    refreshToken<D extends {} = {}>(
        props?: RefreshTokenProps<D>
    ): Promise<boolean>;

    /**
     * Signout
     * @param apiUrl Signout API URL
     */
    signout(apiUrl?: string): Promise<void>;

    /**
     * Switch organization
     * @param apiOrOrg API URL or organization id
     */
    switchOrg(apiOrOrg: string | number): Promise<boolean | undefined>;

    /**
     * Go to the login page
     */
    toLoginPage(): void;

    /**
     * Transform URL
     * @param url URL
     * @returns Transformed url
     */
    transformUrl(url: string): string;

    /**
     * Try login, returning false means is loading
     */
    tryLogin(): Promise<boolean>;

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLogin(user: IUserData, refreshToken: string, keep?: boolean): void;

    /**
     * User logout
     * @param clearToken Clear refresh token or not
     */
    userLogout(clearToken: boolean): void;

    /**
     * User unauthorized
     */
    userUnauthorized(): void;

    /**
     * Show warning message
     * @param message Message
     * @param align Align, default as TopRight
     */
    warning(message: NotificationContent<N>, align?: NotificationAlign): void;
}

/**
 * Core application
 */
export abstract class CoreApp<
    S extends IAppSettings,
    N,
    C extends NotificationCallProps
> implements ICoreApp<S, N, C>
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
     * Application name
     */
    readonly name: string;

    /**
     * Notifier
     */
    readonly notifier: INotifier<N, C>;

    private _culture!: string;
    /**
     * Culture, like zh-CN
     */
    get culture() {
        return this._culture;
    }

    private _currency!: string;
    /**
     * Currency, like USD for US dollar
     */
    get currency() {
        return this._currency;
    }

    private _region!: string;
    /**
     * Country or region, like CN
     */
    get region() {
        return this._region;
    }

    /**
     * Label delegate
     */
    get labelDelegate() {
        return this.get.bind(this);
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

    private _authorized: boolean = false;
    /**
     * Is current authorized
     */
    get authorized() {
        return this._authorized;
    }

    private set authorized(value: boolean) {
        this._authorized = value;
    }

    private _isTryingLogin = false;

    /**
     * Last called with token refresh
     */
    protected lastCalled = false;

    /**
     * Token refresh count down seed
     */
    protected refreshCountdownSeed = 0;

    /**
     * Protected constructor
     * @param settings Settings
     * @param api API
     * @param notifier Notifier
     * @param name Application name
     */
    protected constructor(
        settings: S,
        api: IApi,
        notifier: INotifier<N, C>,
        name: string
    ) {
        this.settings = settings;
        this.api = api;
        this.notifier = notifier;
        this.name = name;

        this.setApi(api);

        const { currentCulture, currentRegion } = settings;
        this.changeCulture(currentCulture);

        this.changeRegion(currentRegion);

        // Setup callback
        this.setup();
    }

    protected setApi(api: IApi) {
        // onRequest, show loading or not, rewrite the property to override default action
        api.onRequest = (data) => {
            if (data.showLoading == null || data.showLoading) {
                this.notifier.showLoading();
            }
        };

        // onComplete, hide loading, rewrite the property to override default action
        api.onComplete = (data) => {
            if (data.showLoading == null || data.showLoading) {
                this.notifier.hideLoading();
            }
            this.lastCalled = true;
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
                this.notifier.alert(this.formatError(error));
            }
        };
    }

    /**
     * Alert action result
     * @param result Action result
     */
    alertResult(result: IActionResult) {
        this.formatResult(result);
        this.notifier.alert(ActionResultError.format(result));
    }

    /**
     * Authorize
     * @param token New token
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    authorize(token?: string, refreshToken?: string, keep?: boolean) {
        // State, when token is null, means logout
        this.authorized = token != null;

        // Token
        this.api.authorize(this.settings.authScheme, token);

        // Cover the current value
        if (keep != null) {
            StorageUtils.setLocalData(
                this.headerTokenField,
                keep ? refreshToken : undefined
            );
            StorageUtils.setSessionData(
                this.headerTokenField,
                keep ? undefined : refreshToken
            );
        }

        // Reset tryLogin state
        this._isTryingLogin = false;

        // Token countdown
        if (this.authorized) this.refreshCountdown(this.userData!.seconds);
        else this.refreshCountdownClear();
    }

    /**
     * Change country or region
     * @param regionId New country or region
     */
    changeRegion(region: string | AddressRegion) {
        // Get data
        let regionId: string;
        let regionItem: AddressRegion | undefined;
        if (typeof region === 'string') {
            regionId = region;
            regionItem = AddressRegion.getById(region);
        } else {
            regionId = region.id;
            regionItem = region;
        }

        // Same
        if (regionId === this._region) return;

        // Not included
        if (regionItem == null || !this.settings.regions.includes(regionId))
            return;

        // Save the id to local storage
        DomUtils.saveCountry(regionId);

        // Set the currency and culture
        this._currency = regionItem.currency;
        this._region = regionId;

        // Hold the current country or region
        this.settings.currentRegion = regionItem;
    }

    /**
     * Change culture
     * @param culture New culture definition
     */
    changeCulture(culture: DataTypes.CultureDefinition) {
        // Name
        const { name } = culture;

        // Same?
        if (this._culture === name) return;

        // Save the cultrue to local storage
        DomUtils.saveCulture(name);

        // Change the API's Content-Language header
        // .net 5 API, UseRequestLocalization, RequestCultureProviders, ContentLanguageHeaderRequestCultureProvider
        this.api.setContentLanguage(name);

        // Set the culture
        this._culture = name;

        // Hold the current resources
        this.settings.currentCulture = culture;

        // Update all supported regions' name
        this.settings.regions.forEach((id) => {
            const region = AddressRegion.getById(id);
            if (region)
                region.name = AddressUtils.getRegionLabel(
                    id,
                    this.labelDelegate
                );
        });
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
        return DateUtils.format(input, currentCulture.name, options, timeZone);
    }

    /**
     * Format money number
     * @param input Input money number
     * @param isInteger Is integer
     * @param options Options
     * @returns Result
     */
    formatMoney(
        input?: number | bigint,
        isInteger: boolean = false,
        options?: Intl.NumberFormatOptions
    ) {
        return NumberUtils.formatMoney(
            input,
            this.currency,
            this.culture,
            isInteger,
            options
        );
    }

    /**
     * Format number
     * @param input Input number
     * @param options Options
     * @returns Result
     */
    formatNumber(input?: number | bigint, options?: Intl.NumberFormatOptions) {
        return NumberUtils.format(input, this.culture, options);
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
     * Format result text
     * @param result Action result
     * @param forceToLocal Force to local labels
     */
    formatResult(result: IActionResult, forceToLocal?: boolean) {
        if ((result.title == null || forceToLocal) && result.type != null) {
            const key = result.type.formatInitial(false);
            result.title = this.get(key);
        }
    }

    /**
     * Get culture resource
     * @param key key
     * @returns Resource
     */
    get<T = string>(key: string): T | undefined {
        const value = this.settings.currentCulture.resources[key];
        if (value == null) return undefined;

        // No strict type convertion here
        // Make sure the type is strictly match
        // Otherwise even request number, may still return the source string type
        return value as T;
    }

    /**
     * Get multiple culture labels
     * @param keys Keys
     */
    getLabels<T extends string>(...keys: T[]): { [K in T]: string } {
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
     * Get all regions
     * @returns Regions
     */
    getRegions() {
        return this.settings.regions.map((id) => {
            return AddressRegion.getById(id)!;
        });
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
     * Get time zone
     * @returns Time zone
     */
    getTimeZone(): string | undefined {
        // settings.timeZone = Utils.getTimeZone()
        return this.settings.timeZone ?? this.ipData?.timezone;
    }

    /**
     * Check use has the specific role permission or not
     * @param roles Roles to check
     * @returns Result
     */
    hasPermission(roles: number | UserRole | number[] | UserRole[]): boolean {
        const userRole = this.userData?.role;
        if (userRole == null) return false;

        if (Array.isArray(roles)) {
            return roles.some((role) => (userRole & role) === role);
        }

        // One role check
        if ((userRole & roles) === roles) return true;

        return false;
    }

    /**
     * Callback where exit a page
     */
    pageExit() {
        this.lastWarning?.dismiss();
    }

    /**
     * Refresh countdown
     * @param seconds Seconds
     */
    protected refreshCountdown(seconds: number) {
        // Make sure is big than 60 seconds
        // Take action 60 seconds before expiry
        seconds -= 60;
        if (seconds <= 0) return;

        // Clear the current timeout seed
        this.refreshCountdownClear();

        // Reset last call flag
        // Any success call will update it to true
        // So first time after login will be always silent
        this.lastCalled = false;

        this.refreshCountdownSeed = window.setTimeout(() => {
            if (this.lastCalled) {
                // Call refreshToken to update access token
                this.refreshToken();
            } else {
                // Popup countdown for user action
                this.freshCountdownUI();
            }
        }, 1000 * seconds);
    }

    protected refreshCountdownClear() {
        // Clear the current timeout seed
        if (this.refreshCountdownSeed > 0) {
            window.clearTimeout(this.refreshCountdownSeed);
            this.refreshCountdownSeed = 0;
        }
    }

    /**
     * Fresh countdown UI
     * @param callback Callback
     */
    abstract freshCountdownUI(callback?: () => PromiseLike<unknown>): void;

    /**
     * Refresh token
     * @param callback Callback
     */
    async refreshToken<D extends {} = {}>(props?: RefreshTokenProps<D>) {
        if (props && props.callback) props.callback(true);
        return true;
    }

    /**
     * Setup callback
     */
    setup() {}

    /**
     * Signout
     * @param apiUrl Signout API URL
     */
    async signout(apiUrl?: string) {
        await this.api.put<boolean>(apiUrl ?? 'User/Signout', undefined, {
            onError: (error) => {
                console.log(error);
                // Prevent further processing
                return false;
            }
        });

        // Clear
        this.userLogout();

        // Go to login page
        this.toLoginPage();
    }

    /**
     * Switch organization
     * @param apiOrOrg API URL or organization id
     */
    async switchOrg(apiOrOrg: string | number) {
        const api =
            typeof apiOrOrg === 'number'
                ? `Organization/Switch/${apiOrOrg}`
                : apiOrOrg;
        const result = await this.api.put<boolean>(api);
        if (result) return await this.refreshToken();
        return result;
    }

    /**
     * Go to the login page
     */
    toLoginPage() {
        window.location.replace(this.transformUrl('/'));
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

    /**
     * Try login, returning false means is loading
     * UI get involved while refreshToken not intended
     */
    async tryLogin() {
        if (this._isTryingLogin) return false;
        this._isTryingLogin = true;
        return true;
    }

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep in local storage or not
     */
    userLogin(user: IUserData, refreshToken: string, keep: boolean = false) {
        this.userData = user;
        this.authorize(user.token, refreshToken, keep);
    }

    /**
     * User logout
     * @param clearToken Clear refresh token or not
     */
    userLogout(clearToken: boolean = true) {
        this.authorize(undefined, undefined, clearToken ? false : undefined);
    }

    /**
     * User unauthorized
     */
    userUnauthorized() {
        this.authorize(undefined, undefined, undefined);
    }

    private lastWarning?: INotification<N, C>;

    /**
     * Show warning message
     * @param message Message
     * @param align Align, default as TopRight
     */
    warning(message: NotificationContent<N>, align?: NotificationAlign) {
        // Same message is open
        if (this.lastWarning?.open && this.lastWarning?.content === message)
            return;

        this.lastWarning = this.notifier.message(
            NotificationMessageType.Warning,
            message,
            undefined,
            {
                align: align ?? NotificationAlign.TopRight
            }
        );
    }
}
