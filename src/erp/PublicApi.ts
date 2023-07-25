import { IApiPayload } from '@etsoo/restclient';
import { DataTypes, ListType, ListType1 } from '@etsoo/shared';
import { Currencies, Currency } from '../business/Currency';
import { AssetUnits, ProductUnit } from '../business/ProductUnit';
import { RepeatOption } from '../business/RepeatOption';
import { BaseApi } from './BaseApi';
import { CurrencyDto } from './dto/CurrencyDto';
import { ExchangeRateDto } from './dto/ExchangeRateDto';
import { ExchangeRateHistoryDto } from './dto/ExchangeRateHistoryDto';
import { PinDto } from './dto/PinDto';
import { PublicOrgProductDto, PublicProductDto } from './dto/PublicProductDto';
import { ParsePinRQ } from './rq/ParsePinRQ';

const cachedCurrencyRates: {
    [P: Currency | string]: ExchangeRateDto | undefined | null;
} = {};

const unitPrefix = 'unit';

/**
 * Public API
 */
export class PublicApi extends BaseApi {
    /**
     * Default currency
     */
    defaultCurrency: string | Currency = this.app.defaultRegion.currency;

    /**
     * Asset units
     * @returns Result
     */
    assetUnits() {
        return this.app.getEnumList(AssetUnits, unitPrefix);
    }

    /**
     * Asset string id units
     * @returns Result
     */
    assetStrUnits() {
        return this.app.getEnumStrList(AssetUnits, unitPrefix);
    }

    /**
     * Base units
     * @returns Result
     */
    baseUnits() {
        return this.app.getEnumStrList(ProductUnit, unitPrefix);
    }

    /**
     * Get currencies
     * @param names Limited currency names for local data, undefined will try to retrive remoately
     * @returns Result
     */
    currencies(): Promise<CurrencyDto[] | undefined>;
    currencies(names: string[] | Currency[] | boolean): ListType1[];
    currencies(names?: string[] | Currency[] | boolean) {
        if (typeof names === 'boolean' && names) {
            return Currencies.map((name) => ({
                id: name,
                label: this.app.get(`currency${name}`) ?? name
            }));
        }

        if (Array.isArray(names)) {
            return names.map((name) => ({
                id: name,
                label: this.app.get(`currency${name}`) ?? name
            }));
        }

        return this.api.get<CurrencyDto[]>('Public/GetCurrencies', undefined, {
            defaultValue: [],
            showLoading: false
        });
    }

    /**
     * Get exchange amount
     * @param amount Amount
     * @param sourceCurrency Source currency
     * @param targetCurrency Target currency
     * @returns Result
     */
    async exchangeAmount(
        amount: number,
        sourceCurrency: Currency | string,
        targetCurrency?: Currency | string
    ) {
        targetCurrency ??= this.app.defaultRegion.currency;

        const [sourceRate, targetRate] = await Promise.all([
            this.exchangeRate(sourceCurrency, {
                showLoading: false
            }),
            this.exchangeRate(targetCurrency, {
                showLoading: false
            })
        ]);
        if (sourceRate == null || targetRate == null) return undefined;

        const result =
            Math.round(
                (1000 * amount * sourceRate.exchangeRate) /
                    targetRate.exchangeRate
            ) / 1000;
        return result;
    }

    /**
     * Get exchange rate
     * @param currency Currency
     * @param payload Payload
     * @param reload Reload data
     * @returns Result
     */
    async exchangeRate(
        currency: Currency | string,
        payload?: IApiPayload<ExchangeRateDto>,
        reload = false
    ) {
        let rate = cachedCurrencyRates[currency];
        if (rate == null || reload) {
            rate =
                currency === this.defaultCurrency
                    ? { exchangeRate: 100, updateTime: new Date() }
                    : await this.api.get(
                          `Public/ExchangeRate/${currency}`,
                          undefined,
                          payload
                      );
            if (rate == null) return undefined;
            cachedCurrencyRates[currency] = rate;
        }
        return rate;
    }

    /**
     * Get exchange rate history
     * @param currencies Currencies
     * @param months Max months
     * @param payload Payload
     * @returns Result
     */
    exchangeRateHistory(
        currencies: (Currency | string)[],
        months?: number,
        payload?: IApiPayload<ExchangeRateHistoryDto[]>
    ) {
        payload ??= { defaultValue: [] };
        return this.api.post(
            'Public/ExchangeRateHistory',
            { currencies, months },
            payload
        );
    }

    /**
     * Get organization's avatar URL
     * @param id Organization id
     * @returns Result
     */
    getOrgAvatar(id: number) {
        return `${this.api.baseUrl}Storage/OrgAvatar/${id}`;
    }

    /**
     * Get currency label
     * @param currency Currency
     * @returns Label
     */
    getCurrencyLabel(currency: Currency | string) {
        const c = `currency${currency}`;
        return this.app.get(c) ?? c;
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Label
     */
    getUnitLabel(unit: ProductUnit | number, isJoined?: boolean | string) {
        const key = ProductUnit[unit];
        const label = this.app.get(unitPrefix + key) ?? key;
        const join = this.getUnitJoin(isJoined);
        if (join) {
            return join.format(label);
        }
        return label;
    }

    private getUnitJoin(isJoined: boolean | string | undefined) {
        return typeof isJoined === 'string'
            ? this.app.get(isJoined) ?? isJoined
            : isJoined
            ? this.app.get('unitJoin')
            : undefined;
    }

    /**
     * Get mobile base64 QRCode
     * @param id User id
     * @param host Host URL
     * @param payload Payload
     */
    mobileQRCode(id?: string, host?: string, payload?: IApiPayload<string>) {
        return this.api.post('Public/MobileQRCode', { id, host }, payload);
    }

    /**
     * Parse Pin data
     * @param input Request data
     * @param payload Payload
     * @returns Result
     */
    parsePin(input: ParsePinRQ | string, payload?: IApiPayload<PinDto>) {
        const rq = typeof input === 'string' ? { pin: input } : input;
        rq.language ??= this.app.culture;
        return this.api.post('Public/ParsePin', rq, payload);
    }

    /**
     * Get public and valid product data
     * @param id Product/Service Id or Uid
     * @param culture Language
     * @param payload Payload
     * @returns Result
     */
    product<T extends number | string>(
        id: T,
        culture?: string,
        payload?: IApiPayload<
            T extends number ? PublicProductDto : PublicOrgProductDto
        >
    ) {
        culture = this.app.checkLanguage(culture);
        return this.api.get(
            `Public/Product/${id}/${culture}`,
            undefined,
            payload
        );
    }

    /**
     *
     * Get all repeat options
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    repeatOptions(options?: string[], isJoined: boolean = true): ListType[] {
        options ??= DataTypes.getEnumKeys(RepeatOption);
        return this.units(options, isJoined);
    }

    /**
     * Get all product units
     * @returns Units
     */
    units(): ListType[];

    /**
     *
     * Get all product units
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    units(options?: string[], isJoined?: boolean): ListType[];

    /**
     *
     * Get all product units
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    units(options?: string[], isJoined?: boolean | string): ListType[] {
        options ??= DataTypes.getEnumKeys(ProductUnit);
        return options.map((key) => {
            const id = DataTypes.getEnumByKey(ProductUnit, key)! as number;
            return {
                id,
                label: this.getUnitLabel(
                    id,
                    this.getUnitJoin(isJoined)
                ).formatInitial(true)
            };
        });
    }
}
