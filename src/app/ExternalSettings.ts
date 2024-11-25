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
    "core" | "accounting" | "crm" | "calandar" | "task" | string,
    ExternalEndpoint
  >;
}

/**
 * External settings namespace
 */
export namespace ExternalSettings {
  /**
   * Create instance
   */
  export function create<T extends IExternalSettings = IExternalSettings>():
    | T
    | undefined {
    if ("settings" in globalThis) {
      const settings = Reflect.get(globalThis, "settings");
      if (typeof settings === "object") {
        if (typeof window !== "undefined") {
          // Host name
          const hostname = globalThis.location.hostname;

          // replace {hostname}
          format(settings, hostname);
        }

        return settings as T;
      }
    }
    return undefined;
  }

  export function format(settings: any, hostname?: string) {
    // Default hostname
    if (!hostname) hostname = "localhost";

    // replace {hostname}
    for (const key in settings) {
      const value = settings[key];
      if (typeof value === "string") {
        settings[key] = value.replace("{hostname}", hostname);
      } else if (typeof value === "object") {
        format(value, hostname);
      }
    }

    return settings;
  }
}
