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
   * Default hostname for substitution
   * 用于替换的默认主机名
   */
  hostname?: string;

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
    settings?: unknown,
    hostname?: string
  ): T {
    // Default settings reading from globalThis
    settings ??= Reflect.get(globalThis, "settings");

    if (settings) {
      if (typeof settings === "string") {
        settings = JSON.parse(settings);
      }

      if (
        settings != null &&
        typeof settings === "object" &&
        "appId" in settings &&
        "endpoint" in settings
      ) {
        const s = settings as T;
        if (hostname) s.hostname = hostname;
        return s;
      }
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
  export function formatHost(setting: string, hostname: string): string;

  export function formatHost(
    setting: Record<string, ExternalEndpoint>,
    hostname?: string | null
  ): Record<string, ExternalEndpoint>;

  export function formatHost(
    setting: string | Record<string, ExternalEndpoint>,
    hostname?: string | null
  ): string | Record<string, ExternalEndpoint> {
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
