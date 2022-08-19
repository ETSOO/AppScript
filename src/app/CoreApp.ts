import {
    INotification,
    INotifier,
    NotificationAlign,
    NotificationCallProps,
    NotificationContent,
    NotificationMessageType,
    NotificationReturn
} from '@etsoo/notificationbase';
import { ApiDataError, IApi, IPData } from '@etsoo/restclient';
import {
    DataTypes,
    DateUtils,
    DomUtils,
    IStorage,
    NumberUtils,
    Utils
} from '@etsoo/shared';
import {
    AES,
    algo,
    enc,
    HmacSHA512,
    lib,
    mode,
    pad,
    PBKDF2,
    SHA3
} from 'crypto-js';
import { AddressRegion } from '../address/AddressRegion';
import { AddressUtils } from '../address/AddressUtils';
import { BridgeUtils } from '../bridges/BridgeUtils';
import { BusinessUtils } from '../business/BusinessUtils';
import { EntityStatus } from '../business/EntityStatus';
import { ProductUnit } from '../business/ProductUnit';
import { IdLabelDto } from '../dto/IdLabelDto';
import { InitCallDto } from '../dto/InitCallDto';
import { ActionResultError } from '../result/ActionResultError';
import { IActionResult } from '../result/IActionResult';
import { InitCallResult, InitCallResultData } from '../result/InitCallResult';
import { IUser } from '../state/User';
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
    callback?: (result: RefreshTokenResult, successData?: string) => void;

    /**
     * Data to pass
     */
    data?: D;

    /**
     * Support relogin or not
     */
    relogin?: boolean;

    /**
     * Show loading bar or not
     */
    showLoading?: boolean;
}

/**
 * App fields
 */
const appFields = [
    'headerToken',
    'serversideDeviceId',
    'deviceId',
    'devices',
    'devicePassphrase'
] as const;

/**
 * Basic type template
 */
export type IAppFields = { [key in typeof appFields[number]]: string };

/**
 * Core application interface
 */
export interface ICoreApp<
    U extends IUser,
    S extends IAppSettings,
    N,
    C extends NotificationCallProps
> {
    /**
     * Settings
     */
    readonly settings: S;

    /**
     * Fields
     */
    readonly fields: IAppFields;

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
     * Device id
     */
    readonly deviceId: string;

    /**
     * Country or region, like CN
     */
    readonly region: string;

    /**
     * Storage
     */
    readonly storage: IStorage;

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
    userData?: U;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Alert action result
     * @param result Action result
     * @param callback Callback
     */
    alertResult(
        result: IActionResult,
        callback?: NotificationReturn<void>
    ): void;

    /**
     * Authorize
     * @param token New token
     * @param refreshToken Refresh token
     */
    authorize(token?: string, refreshToken?: string): void;

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
     * Check the action result is about device invalid
     * @param result Action result
     * @returns true means device is invalid
     */
    checkDeviceResult(result: IActionResult): boolean;

    /**
     * Clear cache data
     */
    clearCacheData(): void;

    /**
     * Clear cached token
     */
    clearCacheToken(): void;

    /**
     * Decrypt message
     * @param messageEncrypted Encrypted message
     * @param passphrase Secret passphrase
     * @returns Pure text
     */
    decrypt(messageEncrypted: string, passphrase?: string): string | undefined;

    /**
     * Enhanced decrypt message
     * @param messageEncrypted Encrypted message
     * @param passphrase Secret passphrase
     * @param durationSeconds Duration seconds, <= 12 will be considered as month
     * @returns Pure text
     */
    decryptEnhanced(
        messageEncrypted: string,
        passphrase?: string,
        durationSeconds?: number
    ): string | undefined;

    /**
     * Detect IP data, call only one time
     * @param callback Callback will be called when the IP is ready
     */
    detectIP(callback?: IDetectIPCallback): void;

    /**
     * Encrypt message
     * @param message Message
     * @param passphrase Secret passphrase
     * @param iterations Iterations, 1000 times, 1 - 99
     * @returns Result
     */
    encrypt(message: string, passphrase?: string, iterations?: number): string;

    /**
     * Enhanced encrypt message
     * @param message Message
     * @param passphrase Secret passphrase
     * @param iterations Iterations, 1000 times, 1 - 99
     * @returns Result
     */
    encryptEnhanced(
        message: string,
        passphrase?: string,
        iterations?: number
    ): string;

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
     * Format error
     * @param error Error
     * @returns Error message
     */
    formatError(error: ApiDataError): string;

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
     * Do refresh token result
     * @param result Result
     * @param initCallCallback InitCall callback
     * @param silent Silent without any popups
     */
    doRefreshTokenResult(
        result: RefreshTokenResult,
        initCallCallback?: (result: boolean) => void,
        silent?: boolean
    ): void;

    /**
     * Format refresh token result
     * @param result Refresh token result
     * @returns Message
     */
    formatRefreshTokenResult(result: RefreshTokenResult): string | undefined;

    /**
     * Format result text
     * @param result Action result
     * @param forceToLocal Force to local labels
     * @returns Message
     */
    formatResult(result: IActionResult, forceToLocal?: boolean): string;

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
    getCacheToken(): string | undefined;

    /**
     * Get all regions
     * @returns Regions
     */
    getRegions(): AddressRegion[];

    /**
     * Get roles
     * @param role Combination role value
     */
    getRoles(role: number): IdLabelDto[];

    /**
     * Get status label
     * @param status Status value
     */
    getStatusLabel(status: number | null | undefined): string;

    /**
     * Get status list
     * @returns list
     */
    getStatusList(): IdLabelDto[];

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
     * Get product unit and repeat option label
     * @param unit Product unit or repeat option
     * @param isJoined Add the join label like 'per Kg' for Kg
     */
    getUnitLabel(unit?: ProductUnit, isJoined?: boolean): string;

    /**
     * Hash message, SHA3 or HmacSHA512, 512 as Base64
     * https://cryptojs.gitbook.io/docs/
     * @param message Message
     * @param passphrase Secret passphrase
     */
    hash(message: string, passphrase?: string): string;

    /**
     * Hash message Hex, SHA3 or HmacSHA512, 512 as Base64
     * https://cryptojs.gitbook.io/docs/
     * @param message Message
     * @param passphrase Secret passphrase
     */
    hashHex(message: string, passphrase?: string): string;

    /**
     * Check use has the specific role permission or not
     * @param roles Roles to check
     * @returns Result
     */
    hasPermission(roles: number | UserRole | number[] | UserRole[]): boolean;

    /**
     * Init call
     * @param callback Callback
     * @param resetKeys Reset all keys first
     * @returns Result
     */
    initCall(
        callback?: (result: boolean) => void,
        resetKeys?: boolean
    ): Promise<void>;

    /**
     * Is valid password, override to implement custom check
     * @param password Input password
     */
    isValidPassword(password: string): boolean;

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
     */
    signout(): Promise<void>;

    /**
     * Get organization list
     * @param items Max items
     * @param serviceId Service id
     * @returns Result
     */
    orgList(
        items?: number,
        serviceId?: number
    ): Promise<IdLabelDto[] | undefined>;

    /**
     * Persist settings to source when application exit
     */
    persist(): void;

    /**
     * Redirect to the Url
     * @param url Url
     */
    redirectTo(url: string): void;

    /**
     * Switch organization
     * @param id Organization id
     * @param serviceId Service id
     */
    switchOrg(id: number, serviceId?: number): Promise<boolean | undefined>;

    /**
     * Go to the login page
     * @param tryLogin Try to login again
     */
    toLoginPage(tryLogin?: boolean): void;

    /**
     * Transform URL
     * @param url URL
     * @returns Transformed url
     */
    transformUrl(url: string): string;

    /**
     * Try login, returning false means is loading
     * UI get involved while refreshToken not intended
     * @param data Additional request data
     */
    tryLogin<D extends {} = {}>(data?: D): Promise<boolean>;

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep login or not
     */
    userLogin(user: U, refreshToken: string, keep?: boolean): void;

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
    U extends IUser,
    S extends IAppSettings,
    N,
    C extends NotificationCallProps
> implements ICoreApp<U, S, N, C>
{
    /**
     * Settings
     */
    readonly settings: S;

    /**
     * Fields
     */
    readonly fields: IAppFields;

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

    /**
     * Storage
     */
    readonly storage: IStorage;

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

    private _deviceId: string;
    /**
     * Country or region, like CN
     */
    get deviceId() {
        return this._deviceId;
    }

    /**
     * Label delegate
     */
    get labelDelegate() {
        return this.get.bind(this);
    }

    private _ipData?: IPData;
    /**
     * IP data
     */
    get ipData() {
        return this._ipData;
    }
    protected set ipData(value: IPData | undefined) {
        this._ipData = value;
    }

    private _userData?: U;
    /**
     * User data
     */
    get userData() {
        return this._userData;
    }
    protected set userData(value: U | undefined) {
        this._userData = value;
    }

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
     * Init call Api URL
     */
    protected initCallApi: string = 'Auth/WebInitCall';

    /**
     * Passphrase for encryption
     */
    protected passphrase: string = '';

    private cachedRefreshToken?: string;

    /**
     * Get persisted fields
     */
    protected get persistedFields() {
        return [
            this.fields.deviceId,
            this.fields.devicePassphrase,
            this.fields.serversideDeviceId,
            this.fields.headerToken
        ];
    }

    /**
     * Protected constructor
     * @param settings Settings
     * @param api API
     * @param notifier Notifier
     * @param storage Storage
     * @param name Application name
     */
    protected constructor(
        settings: S,
        api: IApi,
        notifier: INotifier<N, C>,
        storage: IStorage,
        name: string
    ) {
        this.settings = settings;
        this.api = api;
        this.notifier = notifier;
        this.storage = storage;
        this.name = name;

        // Fields, attach with the name identifier
        this.fields = appFields.reduce(
            (a, v) => ({ ...a, [v]: 'smarterp-' + v + '-' + name }),
            {} as any
        );

        // Device id
        this._deviceId = storage.getData(this.fields.deviceId, '');

        // Restore
        this.restore();

        this.setApi(api);

        const { currentCulture, currentRegion } = settings;
        this.changeCulture(currentCulture);

        this.changeRegion(currentRegion);

        // Setup callback
        this.setup();
    }

    private getDeviceId() {
        return this.deviceId.substring(0, 15);
    }

    private resetKeys() {
        this.storage.clear(
            [
                this.fields.devicePassphrase,
                this.fields.headerToken,
                this.fields.serversideDeviceId
            ],
            false
        );
        this.passphrase = '';
    }

    /**
     * Add app name as identifier
     * @param field Field
     * @returns Result
     */
    protected addIdentifier(field: string) {
        return field + '-' + this.name;
    }

    /**
     * Restore settings from persisted source
     */
    protected restore() {
        // Devices
        const devices = this.storage.getPersistedData<string[]>(
            this.fields.devices,
            []
        );

        if (this.deviceId === '') {
            // First vist, restore and keep the source
            this.storage.copyFrom(this.persistedFields, false);

            // Reset device id
            this._deviceId = this.storage.getData(this.fields.deviceId, '');

            // Totally new, no data restored
            if (this._deviceId === '') return false;
        }

        // Device exists or not
        const d = this.getDeviceId();
        if (devices.includes(d)) {
            // Duplicate tab, session data copied
            // Remove the token, deviceId, and passphrase
            this.resetKeys();
            return false;
        }

        const passphraseEncrypted = this.storage.getData<string>(
            this.fields.devicePassphrase
        );
        if (passphraseEncrypted) {
            // this.name to identifier different app's secret
            const passphraseDecrypted = this.decrypt(
                passphraseEncrypted,
                this.name
            );
            if (passphraseDecrypted != null) {
                // Add the device to the list
                devices.push(d);
                this.storage.setPersistedData(this.fields.devices, devices);

                this.passphrase = passphraseDecrypted;

                return true;
            }

            // Failed, reset keys
            this.resetKeys();
        }

        return false;
    }

    /**
     * Is valid password, override to implement custom check
     * @param password Input password
     */
    isValidPassword(password: string) {
        // Length check
        if (password.length < 6) return false;

        // One letter and number required
        if (/\d+/gi.test(password) && /[a-z]+/gi.test(password)) {
            return true;
        }

        return false;
    }

    /**
     * Persist settings to source when application exit
     */
    persist() {
        // Devices
        const devices = this.storage.getPersistedData<string[]>(
            this.fields.devices
        );
        if (devices != null) {
            const index = devices.indexOf(this.getDeviceId());
            if (index !== -1) {
                // Remove current device from the list
                devices.splice(index, 1);
                this.storage.setPersistedData(this.fields.devices, devices);
            }
        }

        if (!this.authorized) return;
        this.storage.copyTo(this.persistedFields);
    }

    /**
     * Setup Api
     * @param api Api
     */
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
     * Api init call
     * @param data Data
     * @returns Result
     */
    protected async apiInitCall(data: InitCallDto) {
        return await this.api.put<InitCallResult>(this.initCallApi, data);
    }

    /**
     * Check the action result is about device invalid
     * @param result Action result
     * @returns true means device is invalid
     */
    checkDeviceResult(result: IActionResult): boolean {
        if (result.type === 'NoValidData' && result.field === 'Device')
            return true;
        return false;
    }

    /**
     * Init call
     * @param callback Callback
     * @param resetKeys Reset all keys first
     * @returns Result
     */
    async initCall(callback?: (result: boolean) => void, resetKeys?: boolean) {
        // Reset keys
        if (resetKeys) {
            this._deviceId = '';
            this.resetKeys();
        }

        // Passphrase exists?
        if (this.passphrase) {
            if (callback) callback(true);
            return;
        }

        // Serverside encrypted device id
        const identifier = this.storage.getData<string>(
            this.fields.serversideDeviceId
        );

        // Timestamp
        const timestamp = new Date().getTime();

        // Request data
        const data: InitCallDto = {
            timestamp,
            identifier,
            deviceId: this.deviceId ? this.deviceId : undefined
        };

        const result = await this.apiInitCall(data);
        if (result == null) {
            // API error will popup
            if (callback) callback(false);
            return;
        }

        if (result.data == null) {
            // Popup no data error
            this.notifier.alert(this.get<string>('noData')!);
            if (callback) callback(false);
            return;
        }

        if (!result.ok) {
            const seconds = result.data.seconds;
            const validSeconds = result.data.validSeconds;
            if (
                result.title === 'timeDifferenceInvalid' &&
                seconds != null &&
                validSeconds != null
            ) {
                const title = this.get('timeDifferenceInvalid')?.format(
                    seconds.toString(),
                    validSeconds.toString()
                );
                this.notifier.alert(title!);
            } else {
                this.alertResult(result);
            }

            if (callback) callback(false);

            // Clear device id
            this.storage.setData(this.fields.deviceId, undefined);

            return;
        }

        const updateResult = this.initCallUpdate(result.data, data.timestamp);
        if (!updateResult) {
            this.notifier.alert(this.get<string>('noData')! + '(Update)');
        }

        if (callback) callback(updateResult);
    }

    /**
     * Init call update
     * @param data Result data
     * @param timestamp Timestamp
     */
    protected initCallUpdate(
        data: InitCallResultData,
        timestamp: number
    ): boolean {
        // Data check
        if (data.deviceId == null || data.passphrase == null) return false;

        // Decrypt
        // Should be done within 120 seconds after returning from the backend
        const passphrase = this.decrypt(data.passphrase, timestamp.toString());
        if (passphrase == null) return false;

        // Update device id and cache it
        this._deviceId = data.deviceId;
        this.storage.setData(this.fields.deviceId, this._deviceId);

        // Devices
        const devices = this.storage.getPersistedData<string[]>(
            this.fields.devices,
            []
        );
        devices.push(this.getDeviceId());
        this.storage.setPersistedData(this.fields.devices, devices);

        // Current passphrase
        this.passphrase = passphrase;
        this.storage.setData(
            this.fields.devicePassphrase,
            this.encrypt(passphrase, this.name)
        );

        // Previous passphrase
        if (data.previousPassphrase) {
            const prev = this.decrypt(
                data.previousPassphrase,
                timestamp.toString()
            );

            // Update
            const fields = this.initCallEncryptedUpdateFields();
            for (const field of fields) {
                const currentValue = this.storage.getData<string>(field);
                if (currentValue == null || currentValue === '') continue;

                if (prev == null) {
                    // Reset the field
                    this.storage.setData(field, undefined);
                    continue;
                }

                const enhanced = currentValue.indexOf('!') >= 8;
                let newValueSource: string | undefined;

                if (enhanced) {
                    newValueSource = this.decryptEnhanced(
                        currentValue,
                        prev,
                        12
                    );
                } else {
                    newValueSource = this.decrypt(currentValue, prev);
                }

                if (newValueSource == null || newValueSource === '') {
                    // Reset the field
                    this.storage.setData(field, undefined);
                    continue;
                }

                const newValue = enhanced
                    ? this.encryptEnhanced(newValueSource)
                    : this.encrypt(newValueSource);

                this.storage.setData(field, newValue);
            }
        }

        return true;
    }

    /**
     * Init call encrypted fields update
     * @returns Fields
     */
    protected initCallEncryptedUpdateFields(): string[] {
        return [this.fields.headerToken];
    }

    /**
     * Alert action result
     * @param result Action result
     * @param callback Callback
     */
    alertResult(result: IActionResult, callback?: NotificationReturn<void>) {
        this.notifier.alert(this.formatResult(result), callback);
    }

    /**
     * Authorize
     * @param token New token
     * @param refreshToken Refresh token
     */
    authorize(token?: string, refreshToken?: string) {
        // State, when token is null, means logout
        this.authorized = token != null;

        // Token
        this.api.authorize(this.settings.authScheme, token);

        // Cover the current value
        if (refreshToken !== '') {
            if (refreshToken != null) refreshToken = this.encrypt(refreshToken);
            this.storage.setData(this.fields.headerToken, refreshToken);
        }

        // Reset tryLogin state
        this._isTryingLogin = false;

        // Token countdown
        if (this.authorized) this.refreshCountdown(this.userData!.seconds);
        else {
            this.cachedRefreshToken = undefined;
            this.refreshCountdownClear();
        }

        // Host notice
        BridgeUtils.host?.userAuthorization(this.authorized);
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
        this.storage.setPersistedData(DomUtils.CountryField, regionId);

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
        this.storage.setPersistedData(DomUtils.CultureField, name);

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
     * Clear cache data
     */
    clearCacheData() {
        this.clearCacheToken();
        this.storage.setData(this.fields.devicePassphrase, undefined);
    }

    /**
     * Clear cached token
     */
    clearCacheToken() {
        this.cachedRefreshToken = undefined;
        this.storage.setPersistedData(this.fields.headerToken, undefined);
    }

    /**
     * Decrypt message
     * @param messageEncrypted Encrypted message
     * @param passphrase Secret passphrase
     * @returns Pure text
     */
    decrypt(messageEncrypted: string, passphrase?: string) {
        // Iterations
        const iterations = parseInt(messageEncrypted.substring(0, 2), 10);
        if (isNaN(iterations)) return undefined;

        try {
            const salt = enc.Hex.parse(messageEncrypted.substring(2, 34));
            const iv = enc.Hex.parse(messageEncrypted.substring(34, 66));
            const encrypted = messageEncrypted.substring(66);

            const key = PBKDF2(passphrase ?? this.passphrase, salt, {
                keySize: 8, // 256 / 32
                hasher: algo.SHA256,
                iterations: 1000 * iterations
            });

            return AES.decrypt(encrypted, key, {
                iv,
                padding: pad.Pkcs7,
                mode: mode.CBC
            }).toString(enc.Utf8);
        } catch (e) {
            console.log('decrypt', e);
            return undefined;
        }
    }

    /**
     * Enhanced decrypt message
     * @param messageEncrypted Encrypted message
     * @param passphrase Secret passphrase
     * @param durationSeconds Duration seconds, <= 12 will be considered as month
     * @returns Pure text
     */
    decryptEnhanced(
        messageEncrypted: string,
        passphrase?: string,
        durationSeconds?: number
    ) {
        // Timestamp splitter
        const pos = messageEncrypted.indexOf('!');

        // Miliseconds chars are longer than 8
        if (pos < 8 || messageEncrypted.length <= 66) return undefined;

        const timestamp = messageEncrypted.substring(0, pos);

        try {
            if (durationSeconds != null && durationSeconds > 0) {
                const milseconds = Utils.charsToNumber(timestamp);
                if (isNaN(milseconds) || milseconds < 1) return undefined;
                const timespan = new Date().substract(new Date(milseconds));
                if (
                    (durationSeconds <= 12 &&
                        timespan.totalMonths > durationSeconds) ||
                    (durationSeconds > 12 &&
                        timespan.totalSeconds > durationSeconds)
                )
                    return undefined;
            }

            const message = messageEncrypted.substring(pos + 1);
            passphrase = this.encryptionEnhance(
                passphrase ?? this.passphrase,
                timestamp
            );

            return this.decrypt(message, passphrase);
        } catch (e) {
            console.log('decryptEnhanced', e);
            return undefined;
        }
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
     * Encrypt message
     * @param message Message
     * @param passphrase Secret passphrase
     * @param iterations Iterations, 1000 times, 1 - 99
     * @returns Result
     */
    encrypt(message: string, passphrase?: string, iterations?: number) {
        // Default 1 * 1000
        iterations ??= 1;

        const bits = 16; // 128 / 8
        const salt = lib.WordArray.random(bits);
        const key = PBKDF2(passphrase ?? this.passphrase, salt, {
            keySize: 8, // 256 / 32
            hasher: algo.SHA256,
            iterations: 1000 * iterations
        });
        const iv = lib.WordArray.random(bits);

        return (
            iterations.toString().padStart(2, '0') +
            salt.toString(enc.Hex) +
            iv.toString(enc.Hex) +
            AES.encrypt(message, key, {
                iv,
                padding: pad.Pkcs7,
                mode: mode.CBC
            }).toString() // enc.Base64
        );
    }

    /**
     * Enhanced encrypt message
     * @param message Message
     * @param passphrase Secret passphrase
     * @param iterations Iterations, 1000 times, 1 - 99
     * @returns Result
     */
    encryptEnhanced(message: string, passphrase?: string, iterations?: number) {
        // Timestamp
        const timestamp = Utils.numberToChars(new Date().getTime());

        passphrase = this.encryptionEnhance(
            passphrase ?? this.passphrase,
            timestamp
        );

        return timestamp + '!' + this.encrypt(message, passphrase, iterations);
    }

    /**
     * Enchance secret passphrase
     * @param passphrase Secret passphrase
     * @param timestamp Timestamp
     * @returns Enhanced passphrase
     */
    protected encryptionEnhance(passphrase: string, timestamp: string) {
        passphrase += timestamp;
        passphrase += passphrase.length.toString();
        return passphrase;
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
     * Refresh token failed
     */
    protected refreshTokenFailed() {
        this.userUnauthorized();
        this.toLoginPage();
    }

    /**
     * Do refresh token result
     * @param result Result
     * @param initCallCallback InitCall callback
     * @param silent Silent without any popups
     */
    doRefreshTokenResult(
        result: RefreshTokenResult,
        initCallCallback?: (result: boolean) => void,
        silent: boolean = false
    ) {
        if (result === true) return;

        if (
            typeof result === 'object' &&
            !(result instanceof ApiDataError) &&
            this.checkDeviceResult(result)
        ) {
            initCallCallback ??= (result) => {
                if (!result) return;
                this.notifier.alert(
                    this.get<string>('environmentChanged') ??
                        'Environment changed',
                    () => {
                        // Reload the page
                        history.go(0);
                    }
                );
            };

            this.initCall(initCallCallback, true);
            return;
        }

        const message = this.formatRefreshTokenResult(result);
        if (message == null || silent) {
            this.refreshTokenFailed();
            return;
        }

        this.notifier.alert(message, () => {
            this.refreshTokenFailed();
        });
    }

    /**
     * Format refresh token result
     * @param result Refresh token result
     * @returns Message
     */
    formatRefreshTokenResult(result: RefreshTokenResult) {
        // Undefined for boolean
        if (typeof result === 'boolean') return undefined;

        return result instanceof ApiDataError
            ? this.formatError(result)
            : typeof result !== 'string'
            ? ActionResultError.format(result)
            : result;
    }

    /**
     * Format result text
     * @param result Action result
     * @param forceToLocal Force to local labels
     */
    formatResult(result: IActionResult, forceToLocal?: boolean) {
        const title = result.title;
        if (title && /^\w+$/.test(title)) {
            const key = title.formatInitial(false);
            const localTitle = this.get(key);
            if (localTitle) {
                result.title = localTitle;

                // Hold the original title in type when type is null
                if (result.type == null) result.type = title;
            }
        } else if ((title == null || forceToLocal) && result.type != null) {
            // Get label from type
            const key = result.type.formatInitial(false);
            result.title = this.get(key);
        }

        // When title contains {0}, replace with the field label
        if (result.field && result.title?.includes('{0}')) {
            const fieldLabel = this.get(result.field.formatInitial(false));
            if (fieldLabel) result.title = result.title.format(fieldLabel);
        }

        return ActionResultError.format(result);
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
    getCacheToken(): string | undefined {
        // Temp refresh token
        if (this.cachedRefreshToken) return this.cachedRefreshToken;
        return this.storage.getData<string>(this.fields.headerToken);
    }

    /**
     * Get enum item number id list
     * @param em Enum
     * @param prefix Label prefix
     * @param filter Filter
     * @returns List
     */
    protected getEnumList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
        em: E,
        prefix: string,
        filter?: (
            id: E[keyof E],
            key: keyof E & string
        ) => E[keyof E] | undefined
    ): IdLabelDto[] {
        const list: IdLabelDto<number>[] = [];
        const keys = DataTypes.getEnumKeys(em);
        for (const key of keys) {
            let id = em[key as keyof E];
            if (filter) {
                const fid = filter(id, key);
                if (fid == null) continue;
                id = fid;
            }
            if (typeof id !== 'number') continue;
            var label = this.get<string>(prefix + key) ?? key;
            list.push({ id, label });
        }
        return list;
    }

    /**
     * Get enum item string id list
     * @param em Enum
     * @param prefix Label prefix
     * @param filter Filter
     * @returns List
     */
    protected getEnumStrList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
        em: E,
        prefix: string,
        filter?: (
            id: E[keyof E],
            key: keyof E & string
        ) => E[keyof E] | undefined
    ): IdLabelDto<string>[] {
        const list: IdLabelDto<string>[] = [];
        const keys = DataTypes.getEnumKeys(em);
        for (const key of keys) {
            let id = em[key as keyof E];
            if (filter) {
                const fid = filter(id, key);
                if (fid == null) continue;
                id = fid;
            }
            var label = this.get<string>(prefix + key) ?? key;
            list.push({ id: id.toString(), label });
        }
        return list;
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
     * Get roles
     * @param role Combination role value
     */
    getRoles(role: number) {
        return this.getEnumList(UserRole, 'role', (id, _key) => {
            if ((id & role) > 0) return id;
        });
    }

    /**
     * Get status list
     * @returns list
     */
    getStatusList() {
        return this.getEnumList(EntityStatus, 'status');
    }

    /**
     * Get status label
     * @param status Status value
     */
    getStatusLabel(status: number | null | undefined) {
        if (status == null) return '';
        const key = EntityStatus[status];
        return this.get<string>('status' + key) ?? key;
    }

    /**
     * Get refresh token from response headers
     * @param rawResponse Raw response from API call
     * @returns response refresh token
     */
    getResponseToken(rawResponse: any): string | null {
        const response = this.api.transformResponse(rawResponse);
        return this.api.getHeaderValue(
            response.headers,
            'SmartERPRefreshToken'
        );
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
     * Get product unit and repeat option label
     * @param unit Product unit or repeat option
     * @param isJoined Add the join label like 'per Kg' for Kg
     */
    getUnitLabel(unit?: ProductUnit, isJoined?: boolean): string {
        if (unit == null) return '';
        return BusinessUtils.getUnitLabel(unit, this.labelDelegate, isJoined);
    }

    /**
     * Hash message, SHA3 or HmacSHA512, 512 as Base64
     * https://cryptojs.gitbook.io/docs/
     * @param message Message
     * @param passphrase Secret passphrase
     */
    hash(message: string, passphrase?: string) {
        if (passphrase == null)
            return SHA3(message, { outputLength: 512 }).toString(enc.Base64);
        else return HmacSHA512(message, passphrase).toString(enc.Base64);
    }

    /**
     * Hash message Hex, SHA3 or HmacSHA512, 512 as Base64
     * https://cryptojs.gitbook.io/docs/
     * @param message Message
     * @param passphrase Secret passphrase
     */
    hashHex(message: string, passphrase?: string) {
        if (passphrase == null)
            return SHA3(message, { outputLength: 512 }).toString(enc.Hex);
        else return HmacSHA512(message, passphrase).toString(enc.Hex);
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
     * Redirect to the Url
     * @param url Url
     */
    redirectTo(url: string): void {
        window.location.href = url;
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
     * @param props Props
     */
    async refreshToken<D extends {} = {}>(props?: RefreshTokenProps<D>) {
        if (props && props.callback) props.callback(true, undefined);
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
    async signout() {
        await this.api.put<boolean>(
            'User/Signout',
            { deviceId: this.deviceId },
            {
                onError: (error) => {
                    console.log(error);
                    // Prevent further processing
                    return false;
                }
            }
        );

        // Clear
        this.userLogout();

        // Go to login page
        this.toLoginPage();
    }

    /**
     * Get organization list
     * @param items Max items
     * @param serviceId Service id
     * @returns Result
     */
    async orgList(items?: number, serviceId?: number) {
        return await this.api.post<IdLabelDto[]>(
            'Organization/List',
            {
                items,
                serviceId
            },
            { defaultValue: [], showLoading: false }
        );
    }

    /**
     * Switch organization
     * @param id Organization id
     * @param serviceId Service id
     */
    async switchOrg(id: number, serviceId?: number) {
        const api = `Organization/Switch`;
        const result = await this.api.put<boolean>(api, {
            id,
            serviceId,
            deviceId: this.deviceId
        });
        if (result) return await this.refreshToken();
        return result;
    }

    /**
     * Go to the login page
     * @param tryLogin Try to login again
     */
    toLoginPage(tryLogin?: boolean) {
        const url = this.transformUrl(
            '/' + (tryLogin ? '' : '?tryLogin=false')
        );
        this.redirectTo(url);
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
        if (url.startsWith('/')) return home + url.substring(1);

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
     * @param data Additional request data
     * @param showLoading Show loading bar or not during call
     */
    async tryLogin<D extends {} = {}>(_data?: D, _showLoading?: boolean) {
        if (this._isTryingLogin) return false;
        this._isTryingLogin = true;
        return true;
    }

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep login or not
     */
    userLogin(user: U, refreshToken: string, keep?: boolean) {
        this.userData = user;

        // Cache the encrypted serverside device id
        this.storage.setData(this.fields.serversideDeviceId, user.deviceId);

        if (keep) {
            this.authorize(user.token, refreshToken);
        } else {
            this.cachedRefreshToken = this.encrypt(refreshToken);
            this.authorize(user.token, undefined);
        }
    }

    /**
     * User logout
     * @param clearToken Clear refresh token or not
     */
    userLogout(clearToken: boolean = true) {
        this.authorize(undefined, clearToken ? undefined : '');
    }

    /**
     * User unauthorized
     */
    userUnauthorized() {
        this.authorize(undefined, undefined);
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
