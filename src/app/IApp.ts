import {
    INotifier,
    NotificationAlign,
    NotificationCallProps,
    NotificationContent,
    NotificationReturn
} from '@etsoo/notificationbase';
import { ApiDataError, IApi, IPData } from '@etsoo/restclient';
import { DataTypes, DateUtils, IStorage, ListType } from '@etsoo/shared';
import { AddressRegion } from '../address/AddressRegion';
import { ProductUnit } from '../business/ProductUnit';
import { IActionResult } from '../result/IActionResult';
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
export interface RefreshTokenProps<D extends object> {
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
export const appFields = [
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
 * Application interface, for generic version, see ICoreApp
 */
export interface IApp {
    /**
     * Settings
     */
    readonly settings: IAppSettings;

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
    readonly notifier: INotifier<unknown, NotificationCallProps>;

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
    userData?: IUser;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Is screen size down 'sm'
     */
    smDown?: boolean;

    /**
     * Is screen size up 'md'
     */
    mdUp?: boolean;

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
    getRoles(role: number): ListType[];

    /**
     * Get status label
     * @param status Status value
     */
    getStatusLabel(status: number | null | undefined): string;

    /**
     * Get status list
     * @returns list
     */
    getStatusList(): ListType[];

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
    refreshToken<D extends object = {}>(
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
    ): Promise<ListType[] | undefined>;

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
     * Try login, returning false means is loading
     * UI get involved while refreshToken not intended
     * @param data Additional request data
     */
    tryLogin<D extends object = {}>(data?: D): Promise<boolean>;

    /**
     * User login
     * @param user User data
     * @param refreshToken Refresh token
     * @param keep Keep login or not
     */
    userLogin(user: IUser, refreshToken: string, keep?: boolean): void;

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
    warning(
        message: NotificationContent<unknown>,
        align?: NotificationAlign
    ): void;
}