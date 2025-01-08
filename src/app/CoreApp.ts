import {
  INotification,
  INotifier,
  NotificationAlign,
  NotificationCallProps,
  NotificationContent,
  NotificationMessageType,
  NotificationReturn
} from "@etsoo/notificationbase";
import { ApiDataError, createClient, IApi, IPData } from "@etsoo/restclient";
import {
  DataTypes,
  DateUtils,
  DomUtils,
  ErrorData,
  ErrorType,
  ExtendUtils,
  IActionResult,
  IStorage,
  ListType,
  ListType1,
  NumberUtils,
  Utils
} from "@etsoo/shared";
import { AddressRegion } from "../address/AddressRegion";
import { BridgeUtils } from "../bridges/BridgeUtils";
import { DataPrivacy } from "../business/DataPrivacy";
import { EntityStatus } from "../business/EntityStatus";
import { InitCallDto } from "../api/dto/InitCallDto";
import { ActionResultError } from "../result/ActionResultError";
import { InitCallResult, InitCallResultData } from "../result/InitCallResult";
import { IUser } from "../state/User";
import { IAppSettings } from "./AppSettings";
import {
  appFields,
  AppLoginParams,
  AppTryLoginParams,
  FormatResultCustomCallback,
  IApp,
  IAppFields,
  IDetectIPCallback,
  NavigateOptions,
  RefreshTokenProps
} from "./IApp";
import { UserRole } from "./UserRole";
import type CryptoJS from "crypto-js";
import { Currency } from "../business/Currency";
import { ExternalEndpoint } from "./ExternalSettings";
import { ApiRefreshTokenDto } from "../api/dto/ApiRefreshTokenDto";
import { ApiRefreshTokenRQ } from "../api/rq/ApiRefreshTokenRQ";
import { AuthApi } from "../api/AuthApi";

type CJType = typeof CryptoJS;
let CJ: CJType;

const loadCrypto = () => import("crypto-js");

// API refresh token function interface
type ApiRefreshTokenFunction = (
  api: IApi,
  rq: ApiRefreshTokenRQ
) => Promise<[string, number] | undefined>;

// API task data
type ApiTaskData = [IApi, number, number, ApiRefreshTokenFunction, string?];

// System API name
const systemApi = "system";

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

  /**
   * Debug mode
   */
  readonly debug: boolean;

  private _culture!: string;
  /**
   * Culture, like zh-CN
   */
  get culture() {
    return this._culture;
  }

  private _currency!: Currency;
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
   * Device id, randome string from ServiceBase.InitCallAsync
   */
  get deviceId() {
    return this._deviceId;
  }
  protected set deviceId(value: string) {
    this._deviceId = value;
    this.storage.setData(this.fields.deviceId, this._deviceId);
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

  /**
   * Current cached URL
   */
  get cachedUrl() {
    return this.storage.getData(this.fields.cachedUrl);
  }
  set cachedUrl(value: string | undefined | null) {
    this.storage.setData(this.fields.cachedUrl, value);
  }

  /**
   * Keep login or not
   */
  get keepLogin() {
    return this.storage.getData<boolean>(this.fields.keepLogin) ?? false;
  }
  set keepLogin(value: boolean) {
    const field = this.fields.headerToken;
    if (!value) {
      // Clear the token
      this.clearCacheToken();

      // Remove the token field
      this.persistedFields.remove(field);
    } else if (!this.persistedFields.includes(field)) {
      this.persistedFields.push(field);
    }
    this.storage.setData(this.fields.keepLogin, value);
  }

  private _embedded: boolean;
  /**
   * Is embedded
   */
  get embedded() {
    return this._embedded;
  }

  private _isTryingLogin = false;
  /**
   * Is trying login
   */
  get isTryingLogin() {
    return this._isTryingLogin;
  }
  protected set isTryingLogin(value: boolean) {
    this._isTryingLogin = value;
  }

  /**
   * Last called with token refresh
   */
  protected lastCalled = false;

  /**
   * Init call Api URL
   */
  protected initCallApi: string = "Auth/WebInitCall";

  /**
   * Passphrase for encryption
   */
  protected passphrase: string = "";

  private apis: Record<string, ApiTaskData> = {};

  private tasks: [() => PromiseLike<void | false>, number, number][] = [];

  private clearInterval?: () => void;

  /**
   * Get persisted fields
   */
  protected readonly persistedFields: string[];

  /**
   * Protected constructor
   * @param settings Settings
   * @param api API
   * @param notifier Notifier
   * @param storage Storage
   * @param name Application name
   * @param debug Debug mode
   */
  protected constructor(
    settings: S,
    api: IApi | undefined | null,
    notifier: INotifier<N, C>,
    storage: IStorage,
    name: string,
    debug: boolean = false
  ) {
    if (settings?.regions?.length === 0) {
      throw new Error("No regions defined");
    }
    this.settings = settings;

    const region = AddressRegion.getById(settings.regions[0]);
    if (region == null) {
      throw new Error("No default region defined");
    }
    this.defaultRegion = region;

    // Current system refresh token
    const refresh: ApiRefreshTokenFunction = async (api, rq) => {
      if (this.lastCalled) {
        // Call refreshToken to update access token
        await this.refreshToken(
          { token: rq.token, showLoading: false },
          (result) => {
            if (result === true) return;
            console.log(`CoreApp.${this.name}.RefreshToken`, result);
          }
        );
      } else {
        // Popup countdown for user action
        this.freshCountdownUI();
      }
      return undefined;
    };

    if (api) {
      // Base URL of the API
      api.baseUrl = this.settings.endpoint;
      api.name = systemApi;
      this.setApi(api, refresh);
      this.api = api;
    } else {
      this.api = this.createApi(
        systemApi,
        {
          endpoint: settings.endpoint,
          webUrl: settings.webUrl
        },
        refresh
      );
    }

    this.notifier = notifier;
    this.storage = storage;
    this.name = name;
    this.debug = debug;

    // Fields, attach with the name identifier
    this.fields = appFields.reduce(
      (a, v) => ({ ...a, [v]: "smarterp-" + v + "-" + name }),
      {} as any
    );

    // Persisted fields
    this.persistedFields = [
      this.fields.deviceId,
      this.fields.devicePassphrase,
      this.fields.serversideDeviceId,
      this.fields.keepLogin
    ];

    // Device id
    this._deviceId = storage.getData(this.fields.deviceId, "");

    // Embedded
    this._embedded =
      this.storage.getData<boolean>(this.fields.embedded) ?? false;

    const { currentCulture, currentRegion } = settings;

    // Load resources
    Promise.all([loadCrypto(), this.changeCulture(currentCulture)]).then(
      ([cj, _resources]) => {
        CJ = cj.default;

        // Debug
        if (this.debug) {
          console.debug(
            "CoreApp.constructor.ready",
            this._deviceId,
            this.fields,
            cj,
            currentCulture,
            currentRegion
          );
        }

        this.changeRegion(currentRegion);
        this.setup();
      }
    );
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
    this.passphrase = "";
  }

  /**
   * Add app name as identifier
   * @param field Field
   * @returns Result
   */
  protected addIdentifier(field: string) {
    return field + "-" + this.name;
  }

  /**
   * Add root (homepage) to the URL
   * @param url URL to add
   * @returns Result
   */
  addRootUrl(url: string) {
    const page = this.settings.homepage;
    const endSlash = page.endsWith("/");
    return (
      page +
      (endSlash
        ? Utils.trimStart(url, "/")
        : url.startsWith("/")
        ? url
        : "/" + url)
    );
  }

  /**
   * Create Auth API
   * @param api Specify the API to use
   * @returns Result
   */
  protected createAuthApi(api?: IApi) {
    return new AuthApi(this, api);
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

    if (this._deviceId === "") {
      // First vist, restore and keep the source
      this.storage.copyFrom(this.persistedFields, false);

      // Reset device id
      this._deviceId = this.storage.getData(this.fields.deviceId, "");

      // Totally new, no data restored
      if (this._deviceId === "") return false;
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
      const passphraseDecrypted = this.decrypt(passphraseEncrypted, this.name);
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
   * Dispose the application
   */
  dispose() {
    // Avoid duplicated call
    if (!this._isReady) return;

    // Persist storage defined fields
    this.persist();

    // Clear the interval
    this.clearInterval?.();

    // Reset the status to false
    this.isReady = false;
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
      if (devices.remove(this.getDeviceId()).length > 0) {
        this.storage.setPersistedData(this.fields.devices, devices);
      }
    }

    if (!this.authorized) return;

    this.storage.copyTo(this.persistedFields);
  }

  /**
   * Add scheduled task
   * @param task Task, return false to stop
   * @param seconds Interval in seconds
   */
  addTask(task: () => PromiseLike<void | false>, seconds: number) {
    this.tasks.push([task, seconds, seconds]);
  }

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
  ) {
    if (this.apis[name] != null) {
      throw new Error(`API ${name} already exists`);
    }

    const api = createClient();
    api.name = name;
    api.baseUrl = item.endpoint;
    this.setApi(api, refresh);
    return api;
  }

  /**
   * Reset all APIs
   */
  protected resetApis() {
    for (const name in this.apis) {
      const data = this.apis[name];
      this.updateApi(data, undefined, -1);
    }
  }

  /**
   * Update API token and expires
   * @param name Api name
   * @param token Refresh token
   * @param seconds Access token expires in seconds
   */
  updateApi(name: string, token: string | undefined, seconds: number): void;
  updateApi(
    data: ApiTaskData,
    token: string | undefined,
    seconds: number
  ): void;
  updateApi(
    nameOrData: string | ApiTaskData,
    token: string | undefined,
    seconds: number
  ) {
    const api =
      typeof nameOrData === "string" ? this.apis[nameOrData] : nameOrData;
    if (api == null) return;

    // Consider the API call delay
    if (seconds > 0) {
      seconds -= 30;
      if (seconds < 10) seconds = 10;
    }

    api[1] = seconds;
    api[2] = seconds;
    api[4] = token;
  }

  /**
   * Setup Api
   * @param api Api
   */
  protected setApi(api: IApi, refresh?: ApiRefreshTokenFunction) {
    // onRequest, show loading or not, rewrite the property to override default action
    this.setApiLoading(api);

    // Global API error handler
    this.setApiErrorHandler(api);

    // Setup API countdown
    refresh ??= this.apiRefreshToken.bind(this);
    this.apis[api.name] = [api, -1, -1, refresh];
  }

  /**
   * Setup Api error handler
   * @param api Api
   * @param handlerFor401 Handler for 401 error
   */
  setApiErrorHandler(
    api: IApi,
    handlerFor401?: boolean | (() => Promise<void>)
  ) {
    api.onError = (error: ApiDataError) => {
      // Debug
      if (this.debug) {
        console.debug(
          `CoreApp.${this.name}.setApiErrorHandler`,
          api,
          error,
          handlerFor401
        );
      }

      // Error code
      const status = error.response
        ? api.transformResponse(error.response).status
        : undefined;

      if (status === 401) {
        // Unauthorized
        if (handlerFor401 === false) return;
        if (typeof handlerFor401 === "function") {
          handlerFor401();
        } else {
          this.tryLogin();
        }
        return;
      } else if (
        error.response == null &&
        (error.message === "Network Error" ||
          error.message === "Failed to fetch")
      ) {
        // Network error
        this.notifier.alert(this.get("networkError") + ` [${this.name}]`);
        return;
      } else {
        // Log
        console.error(`${this.name} API error`, error);
      }

      // Report the error
      this.notifier.alert(this.formatError(error));
    };
  }

  /**
   * Setup Api loading
   * @param api Api
   */
  setApiLoading(api: IApi) {
    // onRequest, show loading or not, rewrite the property to override default action
    api.onRequest = (data) => {
      // Debug
      if (this.debug) {
        console.debug(
          `CoreApp.${this.name}.setApiLoading.onRequest`,
          api,
          data,
          this.notifier.loadingCount
        );
      }

      if (data.showLoading == null || data.showLoading) {
        this.notifier.showLoading();
      }
    };

    // onComplete, hide loading, rewrite the property to override default action
    api.onComplete = (data) => {
      // Debug
      if (this.debug) {
        console.debug(
          `CoreApp.${this.name}.setApiLoading.onComplete`,
          api,
          data,
          this.notifier.loadingCount,
          this.lastCalled
        );
      }

      if (data.showLoading == null || data.showLoading) {
        this.notifier.hideLoading();

        // Debug
        if (this.debug) {
          console.debug(
            `CoreApp.${this.name}.setApiLoading.onComplete.showLoading`,
            api,
            this.notifier.loadingCount
          );
        }
      }
      this.lastCalled = true;
    };
  }

  /**
   * Setup frontend logging
   * @param action Custom action
   * @param preventDefault Is prevent default action
   */
  setupLogging(
    action?: (data: ErrorData) => void | Promise<void>,
    preventDefault?: ((type: ErrorType) => boolean) | boolean
  ) {
    action ??= (data) => {
      this.api.post("Auth/LogFrontendError", data, {
        onError: (error) => {
          // Use 'debug' to avoid infinite loop
          console.debug("Log front-end error", data, error);

          // Prevent global error handler
          return false;
        }
      });
    };
    DomUtils.setupLogging(action, preventDefault);
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
      result.type === "DataProcessingFailed" ||
      (result.type === "NoValidData" && result.field === "Device")
    )
      return true;
    return false;
  }

  /**
   * Clear device id
   */
  clearDeviceId() {
    this._deviceId = "";
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
      this.notifier.alert(this.get<string>("noData")!);
      if (callback) callback(false);
      return;
    }

    if (!result.ok) {
      const seconds = result.data.seconds;
      const validSeconds = result.data.validSeconds;
      if (
        result.title === "timeDifferenceInvalid" &&
        seconds != null &&
        validSeconds != null
      ) {
        const title = this.get("timeDifferenceInvalid")?.format(
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

    const updateResult = await this.initCallUpdate(result.data, data.timestamp);
    if (!updateResult) {
      this.notifier.alert(this.get<string>("noData")! + "(Update)");
    }

    if (callback) callback(updateResult);
  }

  /**
   * Update passphrase
   * @param passphrase Secret passphrase
   */
  protected updatePassphrase(passphrase: string) {
    // Previous passphrase
    const prev = this.passphrase;

    // Update
    this.passphrase = passphrase;
    this.storage.setData(
      this.fields.devicePassphrase,
      this.encrypt(passphrase, this.name)
    );

    if (prev) {
      const fields = this.initCallEncryptedUpdateFields();
      for (const field of fields) {
        const currentValue = this.storage.getData<string>(field);
        if (currentValue == null || currentValue === "") continue;

        if (prev == null) {
          // Reset the field
          this.storage.setData(field, undefined);
          continue;
        }

        const enhanced = currentValue.indexOf("!") >= 8;
        let newValueSource: string | undefined;

        if (enhanced) {
          newValueSource = this.decryptEnhanced(currentValue, prev, 12);
        } else {
          newValueSource = this.decrypt(currentValue, prev);
        }

        if (newValueSource == null || newValueSource === "") {
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
    this.deviceId = data.deviceId;

    // Devices
    const devices = this.storage.getPersistedData<string[]>(
      this.fields.devices,
      []
    );
    devices.push(this.getDeviceId());
    this.storage.setPersistedData(this.fields.devices, devices);

    // Previous passphrase
    if (data.previousPassphrase) {
      const prev = this.decrypt(data.previousPassphrase, timestamp.toString());
      this.passphrase = prev ?? "";
    }

    // Update passphrase
    this.updatePassphrase(passphrase);

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

  alertResult(
    result: IActionResult | string,
    callback?: NotificationReturn<void>,
    forceToLocal?: FormatResultCustomCallback
  ) {
    const message =
      typeof result === "string"
        ? result
        : this.formatResult(result, forceToLocal);
    this.notifier.alert(message, callback);
  }

  /**
   * Authorize
   * @param token New access token
   * @param schema Access token schema
   * @param refreshToken Refresh token
   */
  authorize(token?: string, schema?: string, refreshToken?: string) {
    // State, when token is null, means logout
    const authorized = token != null;

    // Token
    schema ??= "Bearer";
    this.api.authorize(schema, token);

    // Overwrite the current value
    if (refreshToken !== "") {
      if (refreshToken != null) refreshToken = this.encrypt(refreshToken);
      this.storage.setData(this.fields.headerToken, refreshToken);
    }

    // Reset tryLogin state
    this._isTryingLogin = false;

    // Token countdown
    if (authorized) {
      this.lastCalled = false;
      if (refreshToken) {
        this.updateApi(this.api.name, refreshToken, this.userData!.seconds);
      }
    } else {
      this.updateApi(this.api.name, undefined, -1);
    }

    // Host notice
    BridgeUtils.host?.userAuthorization(authorized);

    // Callback
    this.onAuthorized(authorized);

    // Everything is ready, update the state
    this.authorized = authorized;

    // Persist
    this.persist();
  }

  /**
   * On authorized or not callback
   * @param success Success or not
   */
  protected onAuthorized(success: boolean) {}

  /**
   * Change country or region
   * @param regionId New country or region
   */
  changeRegion(region: string | AddressRegion) {
    // Get data
    let regionId: string;
    let regionItem: AddressRegion | undefined;
    if (typeof region === "string") {
      regionId = region;
      regionItem = AddressRegion.getById(region);
    } else {
      regionId = region.id;
      regionItem = region;
    }

    // Same
    if (regionId === this._region) return;

    // Not included
    if (regionItem == null || !this.settings.regions.includes(regionId)) return;

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
    if (this._culture === name && typeof resources === "object")
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

    if (typeof resources !== "object") {
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
      console.error(`CoreApp.decrypt ${messageEncrypted} error`, e);
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
    const pos = messageEncrypted.indexOf("!");

    // Miliseconds chars are longer than 8
    if (pos < 8 || messageEncrypted.length <= 66) return undefined;

    const timestamp = messageEncrypted.substring(0, pos);

    try {
      if (durationSeconds != null && durationSeconds > 0) {
        const milseconds = Utils.charsToNumber(timestamp);
        if (isNaN(milseconds) || milseconds < 1) return undefined;
        const timespan = new Date().substract(new Date(milseconds));
        if (
          (durationSeconds <= 12 && timespan.totalMonths > durationSeconds) ||
          (durationSeconds > 12 && timespan.totalSeconds > durationSeconds)
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
      console.error(`CoreApp.decryptEnhanced ${messageEncrypted} error`, e);
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
          this.get("fileDownloaded")!
        );
    };

    // https://developer.mozilla.org/en-US/docs/Web/API/UserActivation/isActive
    if (
      "userActivation" in navigator &&
      !(navigator.userActivation as any).isActive
    ) {
      this.notifier.alert(this.get("reactivateTip")!, async () => {
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
      iterations.toString().padStart(2, "0") +
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

    return timestamp + "!" + result;
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
    let more = items.join(", ");
    return `[${this.get("appName")}] ${action} - ${target}${
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
    return `${error.message} (${error.name})`;
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
    if (!familyName) return givenName ?? "";
    if (!givenName) return familyName ?? "";
    const wf = givenName + " " + familyName;
    if (wf.containChinese() || wf.containJapanese() || wf.containKorean()) {
      return familyName + givenName;
    }
    return wf;
  }

  private getFieldLabel(field: string) {
    return this.get(field.formatInitial(false)) ?? field;
  }

  /**
   * Format result text
   * @param result Action result
   * @param forceToLocal Force to local labels
   */
  formatResult(
    result: IActionResult,
    forceToLocal?: FormatResultCustomCallback
  ) {
    // Destruct the result
    const { title, type, field } = result;
    const data = { title, type, field };

    if (type === "ItemExists" && field) {
      // Special case
      const fieldLabel =
        (typeof forceToLocal === "function" ? forceToLocal(data) : undefined) ??
        this.getFieldLabel(field);
      result.title = this.get("itemExists")?.format(fieldLabel);
    } else if (title?.includes("{0}")) {
      // When title contains {0}, replace with the field label
      const fieldLabel =
        (typeof forceToLocal === "function" ? forceToLocal(data) : undefined) ??
        (field ? this.getFieldLabel(field) : "");

      result.title = title.format(fieldLabel);
    } else if (title && /^\w+$/.test(title)) {
      // When title is a single word
      // Hold the original title in type when type is null
      if (type == null) result.type = title;
      const localTitle =
        (typeof forceToLocal === "function" ? forceToLocal(data) : undefined) ??
        this.getFieldLabel(title);
      result.title = localTitle;
    } else if ((title == null || forceToLocal) && type != null) {
      const localTitle =
        (typeof forceToLocal === "function" ? forceToLocal(data) : undefined) ??
        this.getFieldLabel(type);
      result.title = localTitle;
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
    const value = typeof resources === "object" ? resources[key] : undefined;
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
      (a, v) => ({ ...a, [v]: this.get<string>(v) ?? "" }),
      init
    );
  }

  /**
   * Get bool items
   * @returns Bool items
   */
  getBools(): ListType1[] {
    const { no = "No", yes = "Yes" } = this.getLabels("no", "yes");
    return [
      { id: "false", label: no },
      { id: "true", label: yes }
    ];
  }

  /**
   * Get cached token
   * @returns Cached token
   */
  getCacheToken(): string | undefined {
    return this.storage.getData<string>(this.fields.headerToken);
  }

  /**
   * Get data privacies
   * @returns Result
   */
  getDataPrivacies() {
    return this.getEnumList(DataPrivacy, "dataPrivacy");
  }

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
    filter?:
      | ((id: E[keyof E], key: keyof E & string) => E[keyof E] | undefined)
      | E[keyof E][]
  ): ListType[] {
    const list: ListType[] = [];

    const getKey =
      typeof prefix === "function" ? prefix : (key: string) => prefix + key;

    if (Array.isArray(filter)) {
      filter.forEach((id) => {
        if (typeof id !== "number") return;
        const key = DataTypes.getEnumKey(em, id);
        const label = this.get<string>(getKey(key)) ?? key;
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
        if (typeof id !== "number") continue;
        const label = this.get<string>(getKey(key)) ?? key;
        list.push({ id, label });
      }
    }
    return list;
  }

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
    filter?: (id: E[keyof E], key: keyof E & string) => E[keyof E] | undefined
  ): ListType1[] {
    const list: ListType1[] = [];

    const getKey =
      typeof prefix === "function" ? prefix : (key: string) => prefix + key;

    const keys = DataTypes.getEnumKeys(em);
    for (const key of keys) {
      let id = em[key as keyof E];
      if (filter) {
        const fid = filter(id, key);
        if (fid == null) continue;
        id = fid;
      }
      var label = this.get<string>(getKey(key)) ?? key;
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
    return this.get("region" + id) ?? id;
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
    return this.getEnumList(UserRole, "role", (id, _key) => {
      if ((id & role) > 0) return id;
    });
  }

  /**
   * Get status list
   * @param ids Limited ids
   * @returns list
   */
  getStatusList(ids?: EntityStatus[]) {
    return this.getEnumList(EntityStatus, "status", ids);
  }

  /**
   * Get status label
   * @param status Status value
   */
  getStatusLabel(status: number | null | undefined) {
    if (status == null) return "";
    const key = EntityStatus[status];
    return this.get<string>("status" + key) ?? key;
  }

  /**
   * Get refresh token from response headers
   * @param rawResponse Raw response from API call
   * @param tokenKey Refresh token key
   * @returns response refresh token
   */
  getResponseToken(rawResponse: any, tokenKey: string): string | null {
    const response = this.api.transformResponse(rawResponse);
    if (!response.ok) return null;
    return this.api.getHeaderValue(response.headers, tokenKey);
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
    if (typeof to === "number") {
      globalThis.history.go(to);
    } else {
      const { state, replace = false } = options ?? {};

      if (replace) {
        if (state) globalThis.history.replaceState(state, "", to);
        else globalThis.location.replace(to);
      } else {
        if (state) globalThis.history.pushState(state, "", to);
        else globalThis.location.assign(to);
      }
    }
  }

  /**
   * Notify user with success message
   * @param callback Popup close callback
   * @param message Success message
   */
  ok(callback?: NotificationReturn<void>, message?: NotificationContent<N>) {
    message ??= this.get("operationSucceeded")!;
    this.notifier.succeed(message, undefined, callback);
  }

  /**
   * Callback where exit a page
   */
  pageExit() {
    this.lastWarning?.dismiss();
    this.notifier.hideLoading(true);
  }

  /**
   * Fresh countdown UI
   * @param callback Callback
   */
  abstract freshCountdownUI(callback?: () => PromiseLike<unknown>): void;

  /**
   * Refresh token with result
   * @param props Props
   * @param callback Callback
   */
  async refreshToken(
    props?: RefreshTokenProps,
    callback?: (
      result?: boolean | IActionResult | [U, string]
    ) => boolean | void | Promise<boolean>
  ) {
    // Check props
    props ??= {};
    props.token ??= this.getCacheToken();

    // Call refresh token API
    let data = await this.createAuthApi().refreshToken<IActionResult<U>>(props);

    let r: IActionResult;
    if (Array.isArray(data)) {
      const [token, result] = data;
      if (result.ok) {
        if (!token) {
          data = {
            ok: false,
            type: "noData",
            field: "token",
            title: this.get("noData")
          };
        } else if (result.data == null) {
          data = {
            ok: false,
            type: "noData",
            field: "user",
            title: this.get("noData")
          };
        } else {
          // Callback first
          if (callback && (await callback([result.data, token])) === false) {
            return;
          }

          // User login
          this.userLogin(result.data, token);

          // Callback after
          if (callback) {
            await callback(true);
          }

          // Exit
          return;
        }
      } else if (this.checkDeviceResult(result)) {
        if (callback == null || callback(result) !== true) {
          this.initCall((ir) => {
            if (!ir) return;
            this.notifier.alert(
              this.get("environmentChanged") ?? "Environment changed",
              () => {
                // Callback, return true to prevent the default reload action
                if (callback == null || callback() !== true) {
                  // Reload the page
                  history.go(0);
                }
              }
            );
          }, true);
          return;
        }
      }

      r = result;
    } else {
      r = data;
    }

    if (callback == null || callback(r) !== true) {
      this.alertResult(r, () => {
        if (callback) callback(false);
      });
    }
  }

  /**
   * Setup callback
   */
  setup() {
    // Done already
    if (this.isReady) return;

    // Ready
    this.isReady = true;

    // Restore
    this.restore();

    // Pending actions
    this.pendings.forEach((p) => p());

    // Setup scheduled tasks
    this.setupTasks();
  }

  /**
   * Exchange token data
   * @param api API
   * @param token Core system's refresh token to exchange
   * @returns Result
   */
  async exchangeToken(api: IApi, token: string) {
    // Avoid to call the system API
    if (api.name === systemApi) {
      throw new Error("System API is not allowed to exchange token");
    }

    // Call the API quietly, no loading bar and no error popup
    const data = await this.createAuthApi().exchangeToken(
      { token },
      {
        showLoading: false,
        onError: (error) => {
          console.error(`CoreApp.${api.name}.ExchangeToken error`, error);

          // Prevent further processing
          return false;
        }
      }
    );

    if (data) {
      // Update the access token
      api.authorize(data.tokenType, data.accessToken);

      // Update the API
      this.updateApi(api.name, data.refreshToken, data.expiresIn);

      // Update notice
      this.exchangeTokenUpdate(api, data);
    }
  }

  /**
   * Exchange token update, override to get the new token
   * @param api API
   * @param data API refresh token data
   */
  protected exchangeTokenUpdate(api: IApi, data: ApiRefreshTokenDto) {}

  /**
   * Exchange intergration tokens for all APIs
   * @param coreData Core system's token data to exchange
   * @param coreName Core system's name, default is 'core'
   */
  exchangeTokenAll(coreData: ApiRefreshTokenDto, coreName?: string) {
    coreName ??= "core";

    for (const name in this.apis) {
      // Ignore the system API as it has its own logic with refreshToken
      if (name === systemApi) continue;

      const data = this.apis[name];
      const api = data[0];

      // The core API
      if (name === coreName) {
        api.authorize(coreData.tokenType, coreData.accessToken);
        this.updateApi(data, coreData.refreshToken, coreData.expiresIn);
      } else {
        this.exchangeToken(api, coreData.refreshToken);
      }
    }
  }

  /**
   * API refresh token data
   * @param api Current API
   * @param rq Request data
   * @returns Result
   */
  protected async apiRefreshTokenData(
    api: IApi,
    rq: ApiRefreshTokenRQ
  ): Promise<ApiRefreshTokenDto | undefined> {
    // Default appId
    rq.appId ??= this.settings.appId;

    // Call the API quietly, no loading bar and no error popup
    return this.createAuthApi(api).apiRefreshToken(rq, {
      showLoading: false,
      onError: (error) => {
        console.error(`CoreApp.${api.name}.apiRefreshToken error`, error);

        // Prevent further processing
        return false;
      }
    });
  }

  /**
   * API refresh token
   * @param api Current API
   * @param rq Request data
   * @returns Result
   */
  protected async apiRefreshToken(
    api: IApi,
    rq: ApiRefreshTokenRQ
  ): Promise<[string, number] | undefined> {
    // Call the API quietly, no loading bar and no error popup
    const data = await this.apiRefreshTokenData(api, rq);
    if (data == null) return undefined;

    // Update the access token
    api.authorize(data.tokenType, data.accessToken);

    // Return the new refresh token and access token expiration seconds
    return [data.refreshToken, data.expiresIn];
  }

  /**
   * Setup tasks
   */
  protected setupTasks() {
    this.clearInterval = ExtendUtils.intervalFor(() => {
      // Exit when not authorized
      if (!this.authorized) return;

      // APIs
      for (const name in this.apis) {
        // Get the API
        const api = this.apis[name];

        // Skip the negative value or when refresh token is not set
        if (!api[4] || api[2] < 0) continue;

        // Minus one second
        api[2] -= 1;

        // Ready to trigger
        if (api[2] === 0) {
          // Refresh token
          api[3](api[0], { token: api[4] }).then((data) => {
            if (data == null) {
              // Failed, try it again in 2 seconds
              api[2] = 2;
            } else {
              // Reset the API
              const [token, seconds] = data;
              this.updateApi(api, token, seconds);
            }
          });
        }
      }

      for (let t = this.tasks.length - 1; t >= 0; t--) {
        // Get the task
        const task = this.tasks[t];

        // Minus one second
        task[2] -= 1;

        // Remove the tasks with negative value with splice
        if (task[2] < 0) {
          this.tasks.splice(t, 1);
        } else if (task[2] === 0) {
          // Ready to trigger
          // Reset the task
          task[2] = task[1];

          // Trigger the task
          task[0]().then((result) => {
            if (result === false) {
              // Asynchronous task, unsafe to splice the index, flag as pending
              task[2] = -1;
            }
          });
        }
      }
    }, 1000);
  }

  /**
   * Signout, with userLogout and toLoginPage
   * @param action Callback
   */
  async signout(action?: () => void | boolean) {
    // Clear the keep login status
    this.keepLogin = false;

    // Reset all APIs
    this.resetApis();

    const token = this.getCacheToken();
    if (token) {
      const result = await this.createAuthApi().signout(
        {
          deviceId: this.deviceId,
          token
        },
        {
          onError: (error) => {
            console.error(`CoreApp.${this.name}.signout error`, error);
            // Prevent further processing
            return false;
          }
        }
      );

      if (result && !result.ok) {
        console.error(`CoreApp.${this.name}.signout failed`, result);
      }
    }

    // Clear, noTrigger = true, avoid state update
    this.userLogout(true, true);

    if (action == null || action() !== false) {
      // Go to login page
      this.toLoginPage({ params: { tryLogin: false }, removeUrl: true });
    }
  }

  /**
   * Go to the login page
   * @param data Login parameters
   */
  toLoginPage(data?: AppLoginParams) {
    // Destruct
    const { params = {}, removeUrl } = data ?? {};

    // Save the current URL
    this.cachedUrl = removeUrl ? undefined : globalThis.location.href;

    // URL with parameters
    const url = "/".addUrlParams(params);

    this.navigate(url);
  }

  /**
   * Try login, returning false means is loading
   * UI get involved while refreshToken not intended
   * @param data Login parameters
   */
  async tryLogin(data?: AppTryLoginParams) {
    // Check status
    if (this._isTryingLogin) return false;
    this._isTryingLogin = true;

    return true;
  }

  /**
   * Update embedded status
   * @param embedded New embedded status
   * @param isWeb Is web or not
   */
  updateEmbedded(embedded: boolean | undefined | null, isWeb?: boolean) {
    // Check current session when it's undefined
    if (embedded == null) {
      embedded = this.storage.getData<boolean>(this.fields.embedded);
      if (embedded == null) return;
    }

    // Is web way?
    // Pass the true embedded status from parent to child (Both conditions are true)
    if (isWeb && embedded && globalThis.self === globalThis.parent) {
      embedded = false;
    }

    // Ignore the same value
    if (embedded === this._embedded) return;

    // Save the embedded status
    this.storage.setData(this.fields.embedded, embedded);

    // Update the embedded status
    this._embedded = embedded;
  }

  /**
   * User login
   * @param user User data
   * @param refreshToken Refresh token
   */
  userLogin(user: U, refreshToken: string) {
    // Hold the user data
    this.userData = user;

    // Cache the encrypted serverside device id
    if (user.deviceId) {
      this.storage.setData(this.fields.serversideDeviceId, user.deviceId);
    }

    // Authorize
    this.authorize(user.token, user.tokenScheme, refreshToken);
  }

  /**
   * User logout
   * @param clearToken Clear refresh token or not
   * @param noTrigger No trigger for state change
   */
  userLogout(clearToken: boolean = true, noTrigger: boolean = false) {
    this.authorize(undefined, undefined, clearToken ? undefined : "");
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
    if (this.lastWarning?.open && this.lastWarning?.content === message) return;

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
