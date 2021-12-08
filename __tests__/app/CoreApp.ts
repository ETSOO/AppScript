import {
    INotificaseBase,
    INotification,
    Notification,
    NotificationCallProps,
    NotificationContainer,
    NotificationRenderProps
} from '@etsoo/notificationbase';
import { ApiAuthorizationScheme, createClient } from '@etsoo/restclient';
import { DataTypes, DomUtils, Utils } from '@etsoo/shared';
import { AddressUtils } from '../../src/address/AddressUtils';
import { IAppSettings } from '../../src/app/AppSettings';
import { CoreApp } from '../../src/app/CoreApp';
import { zhCN } from '../../src/i18n/zhCN';

// Detected country or region
const { detectedCountry } = DomUtils;

// Detected culture
const { detectedCulture } = DomUtils;

// Supported cultures
const supportedCultures: DataTypes.CultureDefinition[] = [zhCN({})];

// Supported regions
const supportedRegions = ['CN'];

// Class implementation for tests
class NotificationTest extends Notification<any, NotificationCallProps> {
    render(props: NotificationRenderProps, className?: string, options?: any) {
        throw new Error('Method not implemented.');
    }
}

class NotificationContainerTest extends NotificationContainer<
    any,
    NotificationCallProps
> {
    protected addRaw(
        data: INotificaseBase<any, NotificationCallProps>
    ): INotification<any, NotificationCallProps> {
        throw new Error('Method not implemented.');
    }
}

// Container
var container = new NotificationContainerTest((update) => {});

// Arrange
class CoreAppTest extends CoreApp<IAppSettings, {}, NotificationCallProps> {
    /**
     * Constructor
     * @param settings Settings
     * @param name Application name
     */
    constructor() {
        super(
            {
                /**
                 * Endpoint of the API service
                 */
                endpoint: 'http://{hostname}/com.etsoo.SmartERPApi/api/',

                /**
                 * App root url
                 */
                homepage: '',

                /**
                 * Web url of the cloud
                 */
                webUrl: 'http://localhost',

                // Authorization scheme
                authScheme: ApiAuthorizationScheme.Bearer,

                // Detected culture
                detectedCulture,

                // Supported cultures
                cultures: supportedCultures,

                // Supported regions
                regions: supportedRegions,

                // Browser's time zone
                timeZone: Utils.getTimeZone(),

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
                )!
            },
            createClient(),
            container,
            'SmartERP'
        );
    }

    freshCountdownUI(callback?: () => PromiseLike<unknown>): void {
        throw new Error('Method not implemented.');
    }
}

const app = new CoreAppTest();

test('Tests for encrypt / decrypt', () => {
    // Arrange
    const input = 'Hello, world!';
    const passphrase = 'My password';

    // Act
    const encrypted = app.encrypt(input, passphrase);
    const plain = app.decrypt(encrypted, passphrase);
    expect(plain).toEqual(input);
});
