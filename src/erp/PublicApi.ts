import { DataTypes, ListType, ListType1 } from '@etsoo/shared';
import { Currency } from '../business/Currency';
import { ProductUnit } from '../business/ProductUnit';
import { RepeatOption } from '../business/RepeatOption';
import { BaseApi } from './BaseApi';
import { CurrencyDto } from './dto/CurrencyDto';
import { ExchangeRateDto } from './dto/ExchangeRateDto';
import { ExchangeRateHistoryDto } from './dto/ExchangeRateHistoryDto';
import { PublicOrgProductDto, PublicProductDto } from './dto/PublicProductDto';

/**
 * Public API
 */
export class PublicApi extends BaseApi {
    /**
     * Get currencies
     * @param currencyNames Limited currency names for local data, undefined will try to retrive remoately
     * @returns Result
     */
    async currencies<T extends string[] | Currency[] | undefined>(
        currencyNames?: T
    ): Promise<T extends undefined ? CurrencyDto[] | undefined : ListType1[]> {
        if (currencyNames == null)
            return (await this.app.api.get<CurrencyDto[]>(
                'Public/GetCurrencies'
            )) as any;
        else
            return currencyNames.map((name) => ({
                id: name,
                label: this.app.get(`currency${name}`) ?? name
            })) as any;
    }

    /**
     * Get exchange rate
     * @param currency Currency
     * @returns Result
     */
    exchangeRate(currency: Currency | string) {
        return this.app.api.get<ExchangeRateDto>(
            `Public/ExchangeRate/${currency}`
        );
    }

    /**
     * Get exchange rate history
     * @param currencies Currencies
     * @param months Max months
     * @returns Result
     */
    exchangeRateHistory(currencies: (Currency | string)[], months?: number) {
        return this.app.api.post<ExchangeRateHistoryDto[]>(
            'Public/ExchangeRateHistory',
            { currencies, months },
            { defaultValue: [] }
        );
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Label
     */
    getUnitLabel(unit: ProductUnit, isJoined?: boolean | string) {
        const key = ProductUnit[unit];
        const label = this.app.get('unit' + key) ?? key;
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
     */
    mobileQRCode(id?: string, host?: string) {
        return this.app.api.post<string>('Public/MobileQRCode', { id, host });
    }

    /**
     * Get public and valid product data
     * @param id Product/Service Id or Uid
     * @param culture Language
     * @returns Result
     */
    product<T extends number | string>(
        id: T,
        culture?: string
    ): T extends number ? PublicProductDto : PublicOrgProductDto {
        culture = this.app.checkLanguage(culture);
        return this.app.api.post<PublicProductDto>(
            `Public/Product/${id}/${culture}`
        ) as any;
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
