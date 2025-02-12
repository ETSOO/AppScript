/**
 * External endpoint
 */
export type ExternalEndpoint = {
  /**
   * API endpoint
   */
  readonly endpoint: string;

  /**
   * Web url
   */
  readonly webUrl: string;
};

/**
 * External settings items
 */
export interface IExternalSettings extends ExternalEndpoint {
  /**
   * Message hub endpoint
   */
  readonly messageHub?: string;

  /**
   * App root url
   */
  readonly homepage: string;

  /**
   * Application id
   * 程序编号
   */
  readonly appId: number;

  /**
   * Endpoints to other services
   */
  readonly endpoints?: Record<
    "core" | "admin" | "finance" | "crm" | "oa" | "agile" | string,
    ExternalEndpoint
  >;
}

/**
 * External settings namespace
 */
export namespace ExternalSettings {
  /**
   * Sub domain match regular expression
   */
  export let subDomainMatch: RegExp = /(?<=\/\/)[0-9a-z]+(?=\.)/i;

  /**
   * Create settings instance
   * @param settings Settings
   * @returns Result
   */
  export function create<T extends IExternalSettings = IExternalSettings>(
    settings: unknown
  ): T {
    // Default settings reading from globalThis
    settings ??= Reflect.get(globalThis, "settings");

    if (
      settings != null &&
      typeof settings === "object" &&
      "appId" in settings &&
      "endpoint" in settings
    ) {
      return settings as T;
    }

    throw new Error("No external settings found");
  }

  /**
   * Format the app
   * @param hostname Hostname
   * @param app App key
   * @param endpoint Endpoint
   * @returns Result
   */
  export function formatApp(hostname: string, app: string, endpoint: string) {
    return formatHost(endpoint, hostname).replace(subDomainMatch, app);
  }

  /**
   * Format the host
   * @param setting Setting
   * @param hostname Hostname
   * @returns Result
   */
  export function formatHost(setting: string, hostname?: string | null): string;

  export function formatHost(
    setting: Record<string, ExternalEndpoint>,
    hostname?: string | null
  ): Record<string, ExternalEndpoint>;

  export function formatHost(
    setting: undefined,
    hostname?: string | null
  ): undefined;

  export function formatHost(
    setting?: string | Record<string, ExternalEndpoint>,
    hostname?: string | null
  ): string | Record<string, ExternalEndpoint> | undefined {
    // No setting
    if (setting == null) return undefined;

    // Default hostname
    hostname ??= globalThis.location.hostname;

    if (typeof setting === "string") {
      return setting.replace("{hostname}", hostname);
    } else {
      return Object.fromEntries(
        Object.entries(setting).map(([key, value]) => [
          key,
          {
            endpoint: formatApp(hostname, key, value.endpoint),
            webUrl: formatApp(hostname, key, value.webUrl)
          }
        ])
      );
    }
  }
}
