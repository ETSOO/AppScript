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
import {
    AddressApi,
    enUS,
    ExternalSettings,
    IUser,
    PublicApi,
    UserRole
} from '../../src';
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
const supportedCultures: DataTypes.CultureDefinition[] = [zhCN({}), enUS({})];

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
        return new NotificationTest(data.type, data.content);
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
            ExternalSettings.format({
                /**
                 * Endpoint of the API service
                 */
                endpoint: 'http://{hostname}/com.etsoo.SmartERPApi/api/',

                /**
                 * App root url
                 */
                homepage: '/cms',

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
            }),
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

function EnhanceApp<TBase extends DataTypes.MConstructor<CoreAppTest>>(
    Base: TBase
) {
    return class extends Base {
        readonly addressApi = new AddressApi(this);
        readonly publicApi = new PublicApi(this);
    };
}

const appClass = EnhanceApp(CoreAppTest);
const app = new appClass();
app.changeCulture(app.settings.cultures[0]);

test('Tests for addRootUrl', () => {
    expect(app.addRootUrl('/home')).toBe('/cms/home');
    expect(app.addRootUrl('./home')).toBe('/cms/./home');
    expect(app.addRootUrl('home')).toBe('/cms/home');
});

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

test('Tests for isValidPassword', () => {
    expect(app.isValidPassword('12345678')).toBeFalsy();
    expect(app.isValidPassword('abcd3')).toBeFalsy();
    expect(app.isValidPassword('1234abcd')).toBeTruthy();
});

test('Tests for addressApi', async () => {
    const continents = await app.addressApi.continents();
    expect(continents.length).toBe(7);

    const labels = await app.addressApi.getLabels('en-NZ');
    expect(labels['regionHK']).toBe('Hong Kong, China');

    const regions = await app.addressApi.regions('zh-CN');
    const cn = regions.find((r) => r.id === 'CN');
    expect(cn?.label).toBe('中国大陆');
});

test('Tests for publicApi', async () => {
    expect(app.publicApi.getUnitLabel(12, true)).toBe('每年');

    const options = app.publicApi.repeatOptions(['MONTH', 'QUATER', 'YEAR']);
    expect(options[2]).toStrictEqual({ id: 12, label: '每年' });

    const currencies = await app.publicApi.currencies(['NZD', 'AUD', 'USD']);
    expect(currencies[1].id).toBe('AUD');

    //const currenciesRemote = await app.publicApi.currencies();
    //console.log(currenciesRemote);

    //const history = await app.publicApi.exchangeRateHistory(['NZD', 'AUD'], 24);
    //console.log(history);

    //const qrcode = await app.publicApi.mobileQRCode('xz@etsoo.com');
    //console.log(qrcode);

    //const exchangeRate = await app.publicApi.exchangeRate('USD');
    //console.log(exchangeRate);
});
