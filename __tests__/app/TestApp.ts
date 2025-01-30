import {
  INotificaseBase,
  INotification,
  Notification,
  NotificationCallProps,
  NotificationContainer,
  NotificationRenderProps
} from "@etsoo/notificationbase";
import {
  AddressUtils,
  CoreApp,
  createClient,
  Culture,
  ExternalSettings,
  IAppSettings,
  InitCallResultData,
  IUser
} from "../../src";
import { DataTypes, DomUtils, Utils, WindowStorage } from "@etsoo/shared";

// Detected country or region
const { detectedCountry } = DomUtils;

// Detected culture
const { detectedCulture } = DomUtils;

// Supported cultures
const supportedCultures: DataTypes.CultureDefinition[] = [
  Culture.zhHans({}),
  Culture.en({})
];

// Supported regions
const supportedRegions = ["CN"];

// Class implementation for tests
class NotificationTest extends Notification<any, NotificationCallProps> {
  render(props: NotificationRenderProps, className?: string, options?: any) {
    throw new Error("Method not implemented.");
  }
}

class NotificationContainerTest extends NotificationContainer<
  any,
  NotificationCallProps
> {
  protected addRaw(
    data: INotificaseBase<any, NotificationCallProps>
  ): INotification<any, NotificationCallProps> {
    return new NotificationTest(data.type, data.content);
  }
}

// Container
var container = new NotificationContainerTest((update) => {});

// Is local test (integration test)
// Make sure your local environment is ready
export const isLocalTest = vi.stubEnv("NODE_ENV", "local");

// Test application class
export class TestApp extends CoreApp<
  IUser,
  IAppSettings,
  {},
  NotificationCallProps
> {
  /**
   * Constructor
   * @param settings Settings
   * @param name Application name
   */
  constructor() {
    super(
      ExternalSettings.format({
        /**
         * Endpoint of the API service
         */
        endpoint: "http://{hostname}:9000/api/",

        endpoints: {
          core: {
            endpoint: "https://{hostname}:9001/api/",
            webUrl: ""
          }
        },

        /**
         * App root url
         */
        homepage: "/cms",

        /**
         * Web url of the cloud
         */
        webUrl: "https://localhost",

        // Detected culture
        detectedCulture,

        // Supported cultures
        cultures: supportedCultures,

        // Supported regions
        regions: supportedRegions,

        // Current country or region
        currentRegion: AddressUtils.getRegion(
          supportedRegions,
          detectedCountry,
          detectedCulture
        ),

        // Current culture
        currentCulture: DomUtils.getCulture(
          supportedCultures,
          detectedCulture
        )![0]
      }),
      createClient(),
      container,
      new WindowStorage(),
      "SmartERP"
    );
  }

  freshCountdownUI(callback?: () => PromiseLike<unknown>): void {
    throw new Error("Method not implemented.");
  }

  initCallUpdateLocal(data: InitCallResultData, timestamp: number) {
    this.initCallUpdate(data, timestamp);
    return this.passphrase;
  }
}
