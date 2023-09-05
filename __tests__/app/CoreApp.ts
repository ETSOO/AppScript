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
    en,
    EntityStatus,
    ExternalSettings,
    IUser,
    OrgApi,
    PublicApi,
    UserRole,
    zhHans
} from '../../src';
import { AddressUtils } from '../../src/address/AddressUtils';
import { IAppSettings } from '../../src/app/AppSettings';
import { CoreApp } from '../../src/app/CoreApp';
import { InitCallResultData } from '../../src/result/InitCallResult';

// Detected country or region
const { detectedCountry } = DomUtils;

// Detected culture
const { detectedCulture } = DomUtils;

// Supported cultures
const supportedCultures: DataTypes.CultureDefinition[] = [zhHans({}), en({})];

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
                )![0]
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

// Mixins example
function EnhanceApp<TBase extends DataTypes.MConstructor<CoreAppTest>>(
    Base: TBase
) {
    return class extends Base {
        readonly addressApi = new AddressApi(this);
        readonly publicApi = new PublicApi(this);
        readonly orgApi = new OrgApi(this);
    };
}

const appClass = EnhanceApp(CoreAppTest);
const app = new appClass();
app.changeCulture(app.settings.cultures[0]);

test('Test for properties', () => {
    expect(app.settings.currentRegion.label).toBe('中国大陆');
});

test('Test for formatAction', () => {
    Object.assign(app.settings.currentCulture.resources, {
        appName: '司友®云ERP'
    });
    expect(app.formatAction('修改', '客户A')).toBe('[司友®云ERP] 修改 - 客户A');
    expect(app.formatAction('修改', '客户A', '企业')).toBe(
        '[司友®云ERP] 修改 - 客户A, 企业'
    );
});

test('Tests for addRootUrl', () => {
    expect(app.addRootUrl('/home')).toBe('/cms/home');
    expect(app.addRootUrl('./home')).toBe('/cms/./home');
    expect(app.addRootUrl('home')).toBe('/cms/home');
});

test('Tests for encrypt / decrypt', async () => {
    // Arrange
    const input = 'Hello, world!';
    const passphrase = 'My password';

    // Act
    const encrypted = app.encrypt(input, passphrase);
    const plain = app.decrypt(encrypted, passphrase);
    expect(plain).toEqual(input);
});

test('Tests for encryptEnhanced / decryptEnhanced', async () => {
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

test('Tests for formatFullName', () => {
    expect(app.formatFullName('亿速', null)).toBe('亿速');
    expect(app.formatFullName(null, null)).toBe('');
    expect(app.formatFullName('亿速', '思维')).toBe('亿速思维');
    expect(app.formatFullName('Xiao', 'Garry')).toBe('Garry Xiao');
});

test('Tests for getRoles', () => {
    var roles = app.getRoles(UserRole.User | UserRole.Manager | UserRole.Admin);
    expect(roles.length).toBe(3);
    expect(roles.map((r) => r.id)).toEqual([8, 128, 8192]);
});

test('Tests for getStatusList', () => {
    var statuses = app.getStatusList([
        EntityStatus.Normal,
        EntityStatus.Approved,
        EntityStatus.Doing,
        EntityStatus.Completed,
        EntityStatus.Deleted
    ]);
    expect(statuses.length).toBe(5);
    expect(statuses.map((s) => s.id)).toStrictEqual([0, 100, 110, 250, 255]);

    expect(app.getStatusList().length).toBe(9);
});

test('Tests for isValidPassword', () => {
    expect(app.isValidPassword('12345678')).toBeFalsy();
    expect(app.isValidPassword('abcd3')).toBeFalsy();
    expect(app.isValidPassword('1234abcd')).toBeTruthy();
});

test('Tests for addressApi', async () => {
    const regions = app.addressApi.regions();
    const cn = regions.find((r) => r.id === 'CN');
    expect(cn?.label).toBe('中国大陆');

    const favoredRegions = app.addressApi.regions(['US', 'CA']);
    expect(favoredRegions.length).toBe(2);
    expect(favoredRegions.find((region) => region.id === 'US')?.label).toBe(
        '美国'
    );

    const region = app.addressApi.region('US');
    expect(region?.label).toBe('美国');
    const regionFailed = app.addressApi.region('ABC');
    expect(regionFailed).toBeUndefined();

    /*
    const results1 = await app.addressApi.autocomplete({
        query: '青岛市玫瑰庭院',
        region: 'CN',
        language: 'zh-CN'
    });

    const results2 = await app.addressApi.autocomplete({
        query: '青岛市玫瑰庭院',
        language: 'zh-CN'
    });

    const results1 = await app.addressApi.searchPlace({
        query: '青岛市玫瑰庭院',
        region: 'CN',
        language: 'zh-CN'
    });

    const result = await app.addressApi.parsePlace({
        city: '青岛',
        district: '市南'
    });

    const result = await app.addressApi.GetPlaceDetails(
        'ChIJczySyo1qljUR1Jnq4Uqak2I',
        'zh-CN'
    );

    const results2 = await app.addressApi.searchPlace({
        query: '青岛市玫瑰庭院',
        language: 'zh-CN'
    });

    const cities = await app.addressApi.cities('CNHN');
    console.log(cities);

    const districts = await app.addressApi.districts(1181);
    console.log(districts);
    */
});

/*
test('Tests for addressApi Async', async () => {
    const regions = await app.addressApi.getRegions({
        items: 3,
        favoredIds: ['US', 'AU', 'CA', 'NZ']
    });
    expect(regions?.length).toBe(3);
    expect(regions![2].id).toBe('CA');
});
*/

test('Tests for addressApi.continents', () => {
    const continents1 = app.addressApi.continents();
    const continents2 = app.addressApi.continents(true, true);
    expect(continents1.length).toBe(6);
    expect(continents1.some((item) => item.id === 'AN')).toBeFalsy();
    expect(continents2.length).toBe(7);
    expect(continents2[0].id).toBe(1);
});

test('Tests for publicApi', async () => {
    expect(app.publicApi.getUnitLabel(12, true)).toBe('每年');

    const options = app.publicApi.repeatOptions(['MONTH', 'QUATER', 'YEAR']);
    expect(options[2]).toStrictEqual({ id: 12, label: '每年' });

    const currencies = app.publicApi.currencies(['NZD', 'AUD', 'USD']);
    expect(currencies.length).toBe(3);
    expect(currencies[1].id).toBe('AUD');

    const currencies1 = app.publicApi.currencies(true);
    expect(currencies1.length >= 10).toBeTruthy();

    expect(app.publicApi.getCurrencyLabel('USD')).toBe('美元');

    const defaultExchangeRate = await app.publicApi.exchangeRate('CNY', {
        showLoading: false
    });
    expect(defaultExchangeRate?.exchangeRate).toBe(100);

    const url = app.publicApi.getOrgAvatar(1);
    expect(url).toBe(
        'http://localhost/com.etsoo.SmartERPApi/api/Storage/OrgAvatar/1'
    );

    /*
    const amount1 = await app.publicApi.exchangeAmount(1000, 'NZD', 'CNY');
    const amount2 = await app.publicApi.exchangeAmount(100, 'NZD', 'USD');
    console.log(amount1, amount2);

    const orgs = await app.orgApi.list();
    console.log(orgs);

    const orgsQuery = await app.orgApi.query({ currentPage: 1, batchSize: 2 });
    console.log(orgsQuery);

    const cultures = await app.publicApi.supportedCultures();
    expect(cultures?.some((culture) => culture.id === 'zh-Hans')).toBeTruthy();
    */
});
