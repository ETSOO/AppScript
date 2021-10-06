import { AddressContinent } from './AddressContinent';

/**
 * Country or region interface
 */
export interface IAddressRegion {
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
     * Continent
     * 洲
     */
    readonly continent: AddressContinent;

    /**
     * Phone exit code for international dial, like 00 in China
     * 国际拨号的电话退出代码
     */
    readonly exitCode: string;

    /**
     * Area code for international dial, like 86 for China
     * 国际电话区号
     */
    readonly idd: string;

    /**
     * Currency, like CNY for China's currency
     * 币种
     */
    readonly currency: string;

    /**
     * Languages
     * 语言
     */
    readonly languages: string[];

    /**
     * Name
     * 名称
     */
    name: string;
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
        '86',
        'CNY',
        ['zh-CN']
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
        '852',
        'HKD',
        ['zh-HK']
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
        '65',
        'SGD',
        ['zh-SG']
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
        '81',
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
        '1',
        'USD',
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
        '61',
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
        '64',
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
        '44',
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
        '353',
        'IEP',
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
        '49',
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
        '33',
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

    // Typescript constructor shorthand
    constructor(
        public id: string,
        public id3: string,
        public nid: string,
        public continent: AddressContinent,
        public exitCode: string,
        public idd: string,
        public currency: string,
        public languages: string[],
        public name: string = id
    ) {}
}