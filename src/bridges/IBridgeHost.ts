/**
 * Bridge host names enum
 */
export enum BridgeHostName {
  Electron = 0,
  Flutter = 1
}

/**
 * Bridge host interface
 */
export interface IBridgeHost {
  /**
   * Name
   */
  readonly name: BridgeHostName;

  /**
   * Change culture
   * @param locale Locale
   */
  changeCulture(locale: string): void;

  /**
   * Closable from client
   */
  closable(): boolean;

  /**
   * Exit the application
   */
  exit(): void;

  /**
   * Get multiple culture labels
   * @param keys Keys
   */
  getLabels<T extends string>(...keys: T[]): PromiseLike<{ [K in T]: string }>;

  /**
   * Get app start Url / router Url
   */
  getStartUrl(): string | undefined | null;

  /**
   * Load application
   * @param name App name
   * @param startUrl Start Url / router Url
   */
  loadApp(name: string, startUrl?: string): void;

  /**
   * User authorization notice
   * @param authorized Authorized or not
   */
  userAuthorization(authorized: boolean): void;

  /**
   * On update callback
   * @param func Callback function
   */
  onUpdate(func: (app: string, version: string) => void): void;

  /**
   * Set window title
   * @param title Title
   */
  setTitle(title: string): void;
}
