import { Currency } from '../business/Currency';
import { AddressContinent, AddressContinentId } from './AddressContinent';

/**
 * Address region in database
 */
export interface AddressRegionDb {
    /**
     * Id, like CN for China
     * https://www.iban.com/country-codes
     * 国家编号
     */
    readonly id: string;

    /**
     * 3-code id like CHN for China
     * 三个字母国家编号
     */
    readonly id3: string;

    /**
     * Number id, like 156 for China
     * 数字编号
     */
    readonly nid: string;

    /**
     * Continent id
     * 洲编号
     */
    readonly continentId: AddressContinentId;

    /**
     * Phone exit code for international dial, like 00 in China
     * 国际拨号的电话退出代码
     */
    readonly exitCode: string;

    /**
     * National (truck) prefix
     * 国内呼叫的拨号
     */
    readonly nationalPrefix?: string;

    /**
     * Area code for international dial, like 86 for China
     * 国际电话区号
     */
    readonly idd: string;

    /**
     * Currency, like CNY for China's currency
     * 币种
     */
    readonly currency: Currency;

    /**
     * Name
     * 名称
     */
    label: string;

    /**
     * Pinyin or other query assistant data
     * 拼音或其他辅助查询字符串
     */
    py?: string;
}

/**
 * Country or region interface
 */
export interface IAddressRegion extends AddressRegionDb {
    /**
     * Continent
     * 洲
     */
    readonly continent: AddressContinent;

    /**
     * Languages
     * 语言
     */
    readonly languages: string[];
}

/**
 * Address or region
 */
export class AddressRegion implements IAddressRegion {
    /**
     * CN - China
     */
    static CN = new AddressRegion(
        'CN',
        'CHN',
        '156',
        AddressContinent.AS,
        '00',
        '+86',
        '0',
        'CNY',
        ['zh-Hans-CN', 'zh-CN']
    );

    /**
     * HK - HK, China
     * 中国香港
     */
    static HK = new AddressRegion(
        'HK',
        'HKG',
        '344',
        AddressContinent.AS,
        '001',
        '+852',
        undefined,
        'HKD',
        ['zh-Hant-HK', 'zh-HK', 'en-HK']
    );

    /**
     * SG - Singapore
     * 新加坡
     */
    static SG = new AddressRegion(
        'SG',
        'SGP',
        '702',
        AddressContinent.AS,
        '000',
        '+65',
        undefined,
        'SGD',
        ['zh-Hans-SG', 'zh-SG', 'en-SG']
    );

    /**
     * JP - Japan
     * 日本
     */
    static JP = new AddressRegion(
        'JP',
        'JPN',
        '392',
        AddressContinent.AS,
        '010',
        '+81',
        '0',
        'JPY',
        ['ja-JP']
    );

    /**
     * US - United States
     * 美国
     */
    static US = new AddressRegion(
        'US',
        'USA',
        '840',
        AddressContinent.NA,
        '011',
        '+1',
        '1',
        'USD',
        ['en-US']
    );

    /**
     * CA - Canada
     * 加拿大
     */
    static CA = new AddressRegion(
        'CA',
        'CAN',
        '124',
        AddressContinent.NA,
        '011',
        '+1',
        '1',
        'CAD',
        ['en-CA', 'fr-CA']
    );

    /**
     * AU - Australia
     * 澳大利亚
     */
    static AU = new AddressRegion(
        'AU',
        'AUS',
        '036',
        AddressContinent.OC,
        '0011',
        '+61',
        '0',
        'AUD',
        ['en-AU']
    );

    /**
     * NZ - New Zealand
     * 新西兰
     */
    static NZ = new AddressRegion(
        'NZ',
        'NZL',
        '554',
        AddressContinent.OC,
        '00',
        '+64',
        '0',
        'NZD',
        ['en-NZ', 'mi-NZ']
    );

    /**
     * GB - Great Britain
     * 英国
     */
    static GB = new AddressRegion(
        'GB',
        'GBR',
        '826',
        AddressContinent.EU,
        '00',
        '+44',
        '0',
        'GBP',
        ['en-GB']
    );

    /**
     * IE - Ireland
     * 爱尔兰
     */
    static IE = new AddressRegion(
        'IE',
        'IRL',
        '372',
        AddressContinent.EU,
        '00',
        '+353',
        '0',
        'EUR',
        ['en-IE']
    );

    /**
     * DE - Germany
     * 德国
     */
    static DE = new AddressRegion(
        'DE',
        'DEU',
        '276',
        AddressContinent.EU,
        '00',
        '+49',
        '0',
        'EUR',
        ['de-DE']
    );

    /**
     * FR - France
     * 法国
     */
    static FR = new AddressRegion(
        'FR',
        'FRA',
        '250',
        AddressContinent.EU,
        '00',
        '+33',
        '0',
        'EUR',
        ['fr-FR']
    );

    /**
     * All countries and regions
     */
    static all = [
        AddressRegion.CN,
        AddressRegion.HK,
        AddressRegion.SG,
        AddressRegion.JP,
        AddressRegion.US,
        AddressRegion.CA,
        AddressRegion.AU,
        AddressRegion.NZ,
        AddressRegion.GB,
        AddressRegion.IE,
        AddressRegion.DE,
        AddressRegion.FR
    ];

    /**
     * Get country or region by id
     * @param id Country id
     */
    static getById(id: string) {
        return AddressRegion.all.find((c) => c.id === id);
    }

    /**
     * Continent id
     * 洲编号
     */
    readonly continentId: AddressContinentId;

    // Typescript constructor shorthand
    constructor(
        public id: string,
        public id3: string,
        public nid: string,
        public continent: AddressContinent,
        public exitCode: string,
        public idd: string,
        public nationalPrefix: string | undefined,
        public currency: Currency,
        public languages: string[],
        public label: string = id
    ) {
        this.continentId = AddressContinent[continent] as AddressContinentId;
    }
}
