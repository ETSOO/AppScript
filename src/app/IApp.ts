import {
  INotifier,
  NotificationAlign,
  NotificationCallProps,
  NotificationContent,
  NotificationReturn
} from "@etsoo/notificationbase";
import { ApiDataError, IApi, IPData } from "@etsoo/restclient";
import {
  DataTypes,
  DateUtils,
  ErrorData,
  ErrorType,
  IActionResult,
  IStorage,
  ListType,
  ListType1
} from "@etsoo/shared";
import { AddressRegion } from "../address/AddressRegion";
import { IUser } from "../state/User";
import { IAppSettings } from "./AppSettings";
import { UserRole } from "./UserRole";
import { EntityStatus } from "../business/EntityStatus";
import { Currency } from "../business/Currency";
import { ExternalEndpoint } from "./ExternalSettings";
import { ApiRefreshTokenDto } from "../api/dto/ApiRefreshTokenDto";
import { ApiRefreshTokenRQ } from "../api/rq/ApiRefreshTokenRQ";

/**
 * Detect IP callback interface
 */
export interface IDetectIPCallback {
  (): void;
}

/**
 * Navigate options
 */
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

/**
 * Refresh token result type
 * array means success, false means failed but no any message
 * other cases means failed with differnet message
 */
export type RefreshTokenResult<R> = IActionResult | [string | null, R];

/**
 * Format result custom type
 */
export type FormatResultCustom = {
  title?: string;
  type?: string;
  field?: string;
};

/**
 * Format result custom callback type
 */
export type FormatResultCustomCallback =
  | ((data: FormatResultCustom) => string | null | undefined)
  | boolean;

/**
 * Login parameters
 */
export type AppLoginParams = {
  /**
   * Login parameters to pass
   */
  params?: DataTypes.SimpleObject & {
    /**
     * Try login with cached refresh token
     */
    tryLogin?: boolean;
  };

  /**
   * Don't cache current URL instead of the default page
   */
  removeUrl?: boolean;

  /**
   * Show loading bar or not
   */
  showLoading?: boolean;
};

/**
 * App try login parameters
 */
export type AppTryLoginParams = AppLoginParams & {
  /**
   * Callback on failure
   * @param type Failure type
   */
  onFailure?: (type: string) => void;

  /**
   * Callback on success
   */
  onSuccess?: () => void;
};

/**
 * Refresh token props
 */
export interface RefreshTokenProps {
  /**
   * Refresh token
   */
  token?: string;

  /**
   * API URL
   */
  api?: string;

  /**
   * Show loading bar or not
   */
  showLoading?: boolean;

  /**
   * Header token field name
   */
  tokenField?: string;
}

/**
 * App fields
 */
export const appFields = [
  "headerToken",
  "serversideDeviceId",
  "deviceId",
  "devices",
  "devicePassphrase",
  "cachedUrl",
  "embedded",
  "keepLogin"
] as const;

/**
 * Basic type template
 */
export type IAppFields = { [key in (typeof appFields)[number]]: string };

/**
 * Application interface, for generic version, see ICoreApp
 */
export interface IApp {
  /**
   * Settings
   */
  readonly settings: IAppSettings;

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
  readonly currency: Currency;

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
   * Is the app ready
   */
  readonly isReady: boolean;

  /**
   * Is trying to login
   */
  readonly isTryingLogin: boolean;

  /**
   * Application name
   */
  readonly name: string;

  /**
   * Pending actions
   */
  readonly pendings: (() => any)[];

  /**
   * Is debug mode
   */
  readonly debug: boolean;

  /**
   * Is embedded mode
   */
  readonly embedded: boolean;

  /**
   * Cached URL
   */
  cachedUrl: string | undefined | null;

  /**
   * Keep login or not
   */
  keepLogin: boolean;

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
   * Add root (homepage) to the URL
   * @param url URL to add
   * @returns Result
   */
  addRootUrl(url: string): string;

  /**
   * Add scheduled task
   * @param task Task, return false to stop
   * @param interval Interval in milliseconds
   */
  addTask(task: () => PromiseLike<void | false>, interval: number): void;

  /**
   * Alert result
   * @param result Result message
   * @param callback Callback
   */
  alertResult(result: string, callback?: NotificationReturn<void>): void;

  /**
   * Alert action result
   * @param result Action result
   * @param callback Callback
   * @param forceToLocal Force to local labels
   */
  alertResult(
    result: IActionResult,
    callback?: NotificationReturn<void>,
    forceToLocal?: FormatResultCustomCallback
  ): void;

  /**
   * Authorize
   * @param token New access token
   * @param schema Access token schema
   * @param refreshToken Refresh token
   */
  authorize(token?: string, schema?: string, refreshToken?: string): void;

  /**
   * Change country or region
   * @param region New country or region
   */
  changeRegion(region: string | AddressRegion): void;

  /**
   * Change culture
   * @param culture New culture definition
   */
  changeCulture(
    culture: DataTypes.CultureDefinition
  ): Promise<DataTypes.StringRecord>;

  /**
   * Check the action result is about device invalid
   * @param result Action result
   * @returns true means device is invalid
   */
  checkDeviceResult(result: IActionResult): boolean;

  /**
   * Check language is supported or not
   * @param language Language
   * @returns Result
   */
  checkLanguage(language?: string): string;

  /**
   * Clear cache data
   */
  clearCacheData(): void;

  /**
   * Clear cached token
   */
  clearCacheToken(): void;

  /**
   * Clear device id
   */
  clearDeviceId(): void;

  /**
   * Create API client, override to implement custom client creation by name
   * @param name Client name
   * @param item External endpoint item
   * @returns Result
   */
  createApi(
    name: string,
    item: ExternalEndpoint,
    refresh?: (
      api: IApi,
      rq: ApiRefreshTokenRQ
    ) => Promise<[string, number] | undefined>
  ): IApi;

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
   * Dispose the application
   */
  dispose(): void;

  /**
   * Download file
   * @param stream File stream
   * @param filename File name
   * @param callback callback
   */
  download(
    stream: ReadableStream,
    filename?: string,
    callback?: (success: boolean | undefined) => void
  ): Promise<void>;

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
   * Exchange token data
   * @param api API
   * @param token Core system's refresh token to exchange
   * @returns Result
   */
  exchangeToken(api: IApi, token: string): Promise<void>;

  /**
   * Exchange intergration tokens for all APIs
   * @param coreData Core system's token data to exchange
   * @param coreName Core system's name, default is 'core'
   */
  exchangeTokenAll(coreData: ApiRefreshTokenDto, coreName?: string): void;

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
   * Format action
   * @param action Action
   * @param target Target name or title
   * @param items More items
   * @returns Result
   */
  formatAction(action: string, target: string, ...items: string[]): string;

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
    input: number | bigint,
    isInteger?: boolean,
    options?: Intl.NumberFormatOptions
  ): string;

  /**
   * Format number
   * @param input Input number
   * @param options Options
   * @returns Result
   */
  formatNumber(
    input: number | bigint,
    options?: Intl.NumberFormatOptions
  ): string;

  /**
   * Format as full name
   * @param familyName Family name
   * @param givenName Given name
   */
  formatFullName(
    familyName: string | undefined | null,
    givenName: string | undefined | null
  ): string;

  /**
   * Format result text
   * @param result Action result
   * @param forceToLocal Force to local labels
   * @returns Message
   */
  formatResult(
    result: IActionResult,
    forceToLocal?: FormatResultCustomCallback
  ): string;

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
   * Get bool items
   * @returns Bool items
   */
  getBools(): ListType1[];

  /**
   * Get cached token
   * @returns Cached token
   */
  getCacheToken(): string | undefined;

  /**
   * Get data privacies
   * @returns Result
   */
  getDataPrivacies(): ListType[];

  /**
   * Get enum item number id list
   * @param em Enum
   * @param prefix Label prefix or callback
   * @param filter Filter
   * @returns List
   */
  getEnumList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
    em: E,
    prefix: string | ((key: string) => string),
    filter?: (id: E[keyof E], key: keyof E & string) => E[keyof E] | undefined
  ): ListType[];

  /**
   * Get enum item string id list
   * @param em Enum
   * @param prefix Label prefix or callback
   * @param filter Filter
   * @returns List
   */
  getEnumStrList<E extends DataTypes.EnumBase = DataTypes.EnumBase>(
    em: E,
    prefix: string | ((key: string) => string),
    filter?:
      | ((id: E[keyof E], key: keyof E & string) => E[keyof E] | undefined)
      | E[keyof E][]
  ): ListType1[];

  /**
   * Get region label
   * @param id Region id
   * @returns Label
   */
  getRegionLabel(id: string): string;

  /**
   * Get all regions
   * @returns Regions
   */
  getRegions(): AddressRegion[];

  /**
   * Get role label
   * @param role Role value
   * @param joinChar Join char
   * @returns Label(s)
   */
  getRoleLabel(role: number | null | undefined, joinChar?: string): string;

  /**
   * Get roles
   * @param role Combination role value, null for all roles
   */
  getRoles(role?: number): ListType[];

  /**
   * Get status label
   * @param status Status value
   */
  getStatusLabel(status: number | null | undefined): string;

  /**
   * Get status list
   * @param ids Limited ids
   * @returns list
   */
  getStatusList(ids?: EntityStatus[]): ListType[];

  /**
   * Get refresh token from response headers
   * @param rawResponse Raw response from API call
   * @param tokenKey Refresh token key
   * @returns response refresh token
   */
  getResponseToken(rawResponse: any, tokenKey: string): string | null;

  /**
   * Get time zone
   * @returns Time zone
   */
  getTimeZone(): string | undefined;

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
   * Check user has the minimum role permission or not
   * @param role Minumum role
   * @returns Result
   */
  hasMinPermission(role: UserRole): boolean;

  /**
   * Check user has the specific role permission or not
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
   * Is admin user
   * @returns Result
   */
  isAdminUser(): boolean;

  /**
   * Is Finance user
   * @returns Result
   */
  isFinanceUser(): boolean;

  /**
   * Is Manager user
   * @returns Result
   */
  isManagerUser(): boolean;

  /**
   * Is valid password, override to implement custom check
   * @param password Input password
   */
  isValidPassword(password: string): boolean;

  /**
   * Navigate to Url or delta
   * @param url Url or delta
   * @param options Options
   */
  navigate<T extends number | string | URL>(
    to: T,
    options?: T extends number ? never : NavigateOptions
  ): void;

  /**
   * Notify user with success message
   * @param message Success message
   * @param callback Popup close callback
   */
  ok(
    callback?: NotificationReturn<void>,
    message?: NotificationContent<unknown>
  ): void;

  /**
   * Callback where exit a page
   */
  pageExit(): void;

  /**
   * Refresh token
   * @param props Props
   * @param callback Callback
   */
  refreshToken(
    props?: RefreshTokenProps,
    callback?: (result?: boolean | IActionResult) => boolean | void
  ): Promise<void>;

  /**
   * Setup Api error handler
   * @param api Api
   * @param handlerFor401 Handler for 401 error
   */
  setApiErrorHandler(
    api: IApi,
    handlerFor401?: boolean | (() => Promise<void>)
  ): void;

  /**
   * Setup Api loading
   * @param api Api
   */
  setApiLoading(api: IApi): void;

  /**
   * Setup frontend logging
   * @param action Custom action
   * @param preventDefault Is prevent default action
   */
  setupLogging(
    action?: (data: ErrorData) => void | Promise<void>,
    preventDefault?: ((type: ErrorType) => boolean) | boolean
  ): void;

  /**
   * Signout, with userLogout and toLoginPage
   * @param action Callback
   */
  signout(action?: () => void | boolean): Promise<void>;

  /**
   * Persist settings to source when application exit
   */
  persist(): void;

  /**
   * Go to the login page
   * @param data Login parameters
   */
  toLoginPage(data?: AppLoginParams): void;

  /**
   * Try login, returning false means is loading
   * UI get involved while refreshToken not intended
   * @param data Login parameters
   */
  tryLogin(data?: AppLoginParams): Promise<boolean>;

  /**
   * Update API token and expires
   * @param name Api name
   * @param token Refresh token
   * @param seconds Access token expires in seconds
   */
  updateApi(name: string, token: string | undefined, seconds: number): void;

  /**
   * Update embedded status
   * @param embedded New embedded status
   */
  updateEmbedded(embedded?: boolean): void;

  /**
   * User login
   * @param user User data
   * @param refreshToken Refresh token
   */
  userLogin(user: IUser, refreshToken: string): void;

  /**
   * User logout
   * @param clearToken Clear refresh token or not
   * @param noTrigger No trigger for state change
   */
  userLogout(clearToken: boolean, noTrigger?: boolean): void;

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
