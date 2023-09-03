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
    ListType,
    ListType1,
    NumberUtils,
    Utils
} from '@etsoo/shared';
import { AddressRegion } from '../address/AddressRegion';
import { BridgeUtils } from '../bridges/BridgeUtils';
import { DataPrivacy } from '../business/DataPrivacy';
import { EntityStatus } from '../business/EntityStatus';
import { InitCallDto } from '../erp/dto/InitCallDto';
import { ActionResultError } from '../result/ActionResultError';
import { IActionResult } from '../result/IActionResult';
import { InitCallResult, InitCallResultData } from '../result/InitCallResult';
import { IUser } from '../state/User';
import { IAppSettings } from './AppSettings';
import {
    appFields,
    IApp,
    IAppFields,
    IDetectIPCallback,
    NavigateOptions,
    RefreshTokenProps,
    RefreshTokenResult
} from './IApp';
import { UserRole } from './UserRole';
import type CryptoJS from 'crypto-js';
import { IAppApi } from './IAppApi';

type CJType = typeof CryptoJS;
let CJ: CJType;

/**
 * Core application interface
 */
export interface ICoreApp<
    U extends IUser,
    S extends IAppSettings,
    N,
    C extends NotificationCallProps
> extends IApp {
    /**
     * Settings
     */
    readonly settings: S;

    /**
     * Notifier
     */
    readonly notifier: INotifier<N, C>;

    /**
     * User data
     */
    userData?: U;
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
     * Default region
     */
    readonly defaultRegion: AddressRegion;

    /**
     * Fields
     */
    readonly fields: IAppFields;

    /**
     * API, not recommend to use it directly in code, wrap to separate methods
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

    /**
     * Pending actions
     */
    readonly pendings: (() => any)[] = [];

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

    private _isReady: boolean = false;
    /**
     * Is the app ready
     */
    get isReady() {
        return this._isReady;
    }

    private set isReady(value: boolean) {
        this._isReady = value;
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
        if (settings?.regions?.length === 0) {
            throw new Error('No regions defined');
        }
        this.settings = settings;

        const region = AddressRegion.getById(settings.regions[0]);
        if (region == null) {
            throw new Error('No default region defined');
        }
        this.defaultRegion = region;

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

        this.setApi(api);

        const { currentCulture, currentRegion } = settings;

        // Load resources
        Promise.all([
            import('crypto-js'),
            this.changeCulture(currentCulture)
        ]).then(([cj, _resources]) => {
            (CJ = cj), this.changeRegion(currentRegion);
            this.setup();
        });
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
     * Add root (homepage) to the URL
     * @param url URL to add
     * @returns Result
     */
    addRootUrl(url: string) {
        const page = this.settings.homepage;
        const endSlash = page.endsWith('/');
        return (
            page +
            (endSlash
                ? Utils.trimStart(url, '/')
                : url.startsWith('/')
                ? url
                : '/' + url)
        );
    }

    /**
     * Restore settings from persisted source
     */
    protected async restore() {
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
        // Base URL of the API
        api.baseUrl = this.settings.endpoint;

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
        if (
            result.type === 'DataProcessingFailed' ||
            (result.type === 'NoValidData' && result.field === 'Device')
        )
            return true;
        return false;
    }

    /**
     * Clear device id
     */
    clearDeviceId() {
        this._deviceId = '';
        this.storage.clear([this.fields.deviceId], false);
        this.storage.clear([this.fields.deviceId], true);
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
            this.clearDeviceId();
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
            this.clearDeviceId();

            return;
        }

        const updateResult = await this.initCallUpdate(
            result.data,
            data.timestamp
        );
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
    protected async initCallUpdate(
        data: InitCallResultData,
        timestamp: number
    ): Promise<boolean> {
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
     * @param result Action result or message
     * @param callback Callback
     */
    alertResult(
        result: IActionResult | string,
        callback?: NotificationReturn<void>
    ) {
        const message =
            typeof result === 'string' ? result : this.formatResult(result);
        this.notifier.alert(message, callback);
    }

    /**
     * Service application API login
     * @param appApi Service application API
     * @param relogin Relogin try
     * @param callback Callback
     */
    apiLogin(
        appApi: IAppApi,
        relogin: boolean = true,
        callback?: (result: RefreshTokenResult, successData?: string) => void
    ) {
        return this.refreshToken({
            callback,
            data: appApi.getrefreshTokenData(),
            relogin,
            showLoading: false,
            appApi
        });
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

        // Overwrite the current value
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
        this.updateRegionLabel();
    }

    /**
     * Change culture
     * @param culture New culture definition
     * @param onReady On ready callback
     */
    async changeCulture(culture: DataTypes.CultureDefinition) {
        // Name
        const { name } = culture;

        // Same?
        let resources = culture.resources;
        if (this._culture === name && typeof resources === 'object')
            return resources;

        // Save the cultrue to local storage
        this.storage.setPersistedData(DomUtils.CultureField, name);

        // Change the API's Content-Language header
        // .net 5 API, UseRequestLocalization, RequestCultureProviders, ContentLanguageHeaderRequestCultureProvider
        this.api.setContentLanguage(name);

        // Set the culture
        this._culture = name;

        // Hold the current resources
        this.settings.currentCulture = culture;

        if (typeof resources !== 'object') {
            resources = await resources();

            // Set static resources back
            culture.resources = resources;
        }
        this.updateRegionLabel();

        return resources;
    }

    /**
     * Update current region label
     */
    protected updateRegionLabel() {
        const region = this.settings.currentRegion;
        region.label = this.getRegionLabel(region.id);
    }

    /**
     * Check language is supported or not, return a valid language when supported
     * @param language Language
     * @returns Result
     */
    checkLanguage(language?: string) {
        if (language) {
            const [cultrue, match] = DomUtils.getCulture(
                this.settings.cultures,
                language
            );
            if (cultrue != null && match != DomUtils.CultureMatch.Default)
                return cultrue.name;
        }

        // Default language
        return this.culture;
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

        const { PBKDF2, algo, enc, AES, pad, mode } = CJ;

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
     * Download file
     * @param stream File stream
     * @param filename File name
     * @param callback callback
     */
    async download(
        stream: ReadableStream,
        filename?: string,
        callback?: (success: boolean | undefined) => void
    ) {
        const downloadFile = async () => {
            let success = await DomUtils.downloadFile(
                stream,
                filename,
                BridgeUtils.host == null
            );
            if (success == null) {
                success = await DomUtils.downloadFile(stream, filename, false);
            }

            if (callback) {
                callback(success);
            } else if (success)
                this.notifier.message(
                    NotificationMessageType.Success,
                    this.get('fileDownloaded')!
                );
        };

        // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation/isActive
        if (
            'userActivation' in navigator &&
            !(navigator.userActivation as any).isActive
        ) {
            this.notifier.alert(this.get('reactivateTip')!, async () => {
                await downloadFile();
            });
        } else {
            await downloadFile();
        }
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

        const { lib, PBKDF2, algo, enc, AES, pad, mode } = CJ;

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

        const result = this.encrypt(message, passphrase, iterations);

        return timestamp + '!' + result;
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
     * Format action
     * @param action Action
     * @param target Target name or title
     * @param items More items
     * @returns Result
     */
    formatAction(action: string, target: string, ...items: string[]) {
        let more = items.join(', ');
        return `[${this.get('appName')}] ${action} - ${target}${
            more ? `, ${more}` : more
        }`;
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
        input: number | bigint,
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
    formatNumber(input: number | bigint, options?: Intl.NumberFormatOptions) {
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
     * Format as full name
     * @param familyName Family name
     * @param givenName Given name
     */
    formatFullName(
        familyName: string | undefined | null,
        givenName: string | undefined | null
    ) {
        if (!familyName) return givenName ?? '';
        if (!givenName) return familyName ?? '';
        const wf = givenName + ' ' + familyName;
        if (wf.containChinese() || wf.containJapanese() || wf.containKorean()) {
            return familyName + givenName;
        }
        return wf;
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
        // Make sure the resource files are loaded first
        const resources = this.settings.currentCulture.resources;
        const value =
            typeof resources === 'object' ? resources[key] : undefined;
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
     * Get bool items
     * @returns Bool items
     */
    getBools(): ListType1[] {
        const { no = 'No', yes = 'Yes' } = this.getLabels('no', 'yes');
        return [
            { id: 'false', label: no },
            { id: 'true', label: yes }
        ];
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
     * Get data privacies
     * @returns Result
     */
    getDataPrivacies() {
        return this.getEnumList(DataPrivacy, 'dataPrivacy');
    }

    /**
     * Get enum item number id list
     * @param em Enum
     * @param prefix Label prefix
     * @param filter Filter
     * @returns List
     */
    getEnumList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
        em: E,
        prefix: string,
        filter?:
            | ((
                  id: E[keyof E],
                  key: keyof E & string
              ) => E[keyof E] | undefined)
            | E[keyof E][]
    ): ListType[] {
        const list: ListType[] = [];

        if (Array.isArray(filter)) {
            filter.forEach((id) => {
                if (typeof id !== 'number') return;
                const key = DataTypes.getEnumKey(em, id);
                var label = this.get<string>(prefix + key) ?? key;
                list.push({ id, label });
            });
        } else {
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
    getEnumStrList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
        em: E,
        prefix: string,
        filter?: (
            id: E[keyof E],
            key: keyof E & string
        ) => E[keyof E] | undefined
    ): ListType1[] {
        const list: ListType1[] = [];
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
     * Get region label
     * @param id Region id
     * @returns Label
     */
    getRegionLabel(id: string) {
        return this.get('region' + id) ?? id;
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
     * @param ids Limited ids
     * @returns list
     */
    getStatusList(ids?: EntityStatus[]) {
        return this.getEnumList(EntityStatus, 'status', ids);
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
     * Hash message, SHA3 or HmacSHA512, 512 as Base64
     * https://cryptojs.gitbook.io/docs/
     * @param message Message
     * @param passphrase Secret passphrase
     */
    hash(message: string, passphrase?: string) {
        const { SHA3, enc, HmacSHA512 } = CJ;
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
        const { SHA3, enc, HmacSHA512 } = CJ;
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
     * Is admin user
     * @returns Result
     */
    isAdminUser() {
        return this.hasPermission([UserRole.Admin, UserRole.Founder]);
    }

    /**
     * Is Finance user
     * @returns Result
     */
    isFinanceUser() {
        return this.hasPermission(UserRole.Finance) || this.isAdminUser();
    }

    /**
     * Is HR user
     * @returns Result
     */
    isHRUser() {
        return this.hasPermission(UserRole.HRManager) || this.isAdminUser();
    }

    /**
     * Navigate to Url or delta
     * @param url Url or delta
     * @param options Options
     */
    navigate<T extends number | string | URL>(
        to: T,
        options?: T extends number ? never : NavigateOptions
    ) {
        if (typeof to === 'number') {
            globalThis.history.go(to);
        } else {
            const { state, replace = false } = options ?? {};

            if (replace) {
                if (state) globalThis.history.replaceState(state, '', to);
                else globalThis.location.replace(to);
            } else {
                if (state) globalThis.history.pushState(state, '', to);
                else globalThis.location.assign(to);
            }
        }
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
     * @param props Props
     */
    async refreshToken<D extends object = {}>(props?: RefreshTokenProps<D>) {
        if (props && props.callback) props.callback(true, undefined);
        return true;
    }

    /**
     * Setup callback
     */
    setup() {
        // Ready
        this.isReady = true;

        // Restore
        this.restore();

        // Pending actions
        this.pendings.forEach((p) => p());
    }

    /**
     * Signout, with userLogout and toLoginPage
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

        // Clear, noTrigger = true, avoid state update
        this.userLogout(true, true);

        // Go to login page
        this.toLoginPage(false, true);
    }

    /**
     * Go to the login page
     * @param tryLogin Try to login again
     * @param removeUrl Remove current URL for reuse
     */
    toLoginPage(tryLogin?: boolean, removeUrl?: boolean) {
        const url =
            `/?tryLogin=${tryLogin ?? false}` +
            (removeUrl ? '' : '&url=' + encodeURIComponent(location.href));

        this.navigate(url);
    }

    /**
     * Try login, returning false means is loading
     * UI get involved while refreshToken not intended
     * @param data Additional request data
     * @param showLoading Show loading bar or not during call
     */
    async tryLogin<D extends object = {}>(_data?: D, _showLoading?: boolean) {
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
     * @param noTrigger No trigger for state change
     */
    userLogout(clearToken: boolean = true, noTrigger: boolean = false) {
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
