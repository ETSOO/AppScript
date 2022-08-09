import {
    INotificaseBase,
    INotification,
    Notification,
    NotificationCallProps,
    NotificationContainer,
    NotificationRenderProps
} from '@etsoo/notificationbase';
import { ApiAuthorizationScheme, createClient } from '@etsoo/restclient';
import { DataTypes, DomUtils, Utils, WindowStorage } from '@etsoo/shared';
import { BusinessUtils, IUser, UserRole } from '../../src';
import { AddressUtils } from '../../src/address/AddressUtils';
import { IAppSettings } from '../../src/app/AppSettings';
import { CoreApp } from '../../src/app/CoreApp';
import { zhCN } from '../../src/i18n/zhCN';
import { InitCallResultData } from '../../src/result/InitCallResult';

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
class CoreAppTest extends CoreApp<
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
            new WindowStorage(),
            'SmartERP'
        );
    }

    freshCountdownUI(callback?: () => PromiseLike<unknown>): void {
        throw new Error('Method not implemented.');
    }

    initCallUpdateLocal(data: InitCallResultData, timestamp: number) {
        this.initCallUpdate(data, timestamp);
        return this.passphrase;
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

test('Tests for encryptEnhanced / decryptEnhanced', () => {
    // Arrange
    const input = 'Hello, world!';
    const passphrase = 'My password';

    // Act
    const encrypted = app.encryptEnhanced(input, passphrase);
    const plain = app.decryptEnhanced(encrypted, passphrase);
    expect(plain).toEqual(input);
});

test('Tests for initCallUpdateLocal', () => {
    // Act
    const passphrase = app.initCallUpdateLocal(
        {
            deviceId:
                'ZmNjZlov+10067A1520126643352C2022735B85DC8F380088468402C98A5631A8CFBE14E134zXfxmw77lFopTTlbqOfsK2KUqPSsTAQb35Ejrm1BAvUaQH3SuZcwGYu3+PQ/Rd56',
            passphrase:
                '01397BF28A93FC031BC8B9B808F880F12C398AB792DF2ADE7A8768CADD2259EB50HJuKhqGuLQO+SmvCVzuEGUN4TdkUuPMWR0E6lliszbNiXboCziXx5SdfX3lMpoBX'
        },
        1639282438620
    );
    expect(passphrase).not.toBeNull();
});

test('Tests for getRoles', () => {
    var roles = app.getRoles(UserRole.User | UserRole.Manager | UserRole.Admin);
    expect(roles.length).toBe(3);
    expect(roles.map((r) => r.id)).toEqual([8, 128, 8192]);
});

test('Tests for getUnitLabel', () => {
    expect(app.getUnitLabel(12, true)).toBe('每年');
});

test('Tests for isValidPassword', () => {
    expect(app.isValidPassword('12345678')).toBeFalsy();
    expect(app.isValidPassword('abcd3')).toBeFalsy();
    expect(app.isValidPassword('1234abcd')).toBeTruthy();
});

test('Tests for getRepeatOptions', () => {
    const options = BusinessUtils.getRepeatOptions(app.labelDelegate, [
        'MONTH',
        'QUATER',
        'YEAR'
    ]);

    expect(options[2]).toStrictEqual({ id: 12, label: '每年' });
});
