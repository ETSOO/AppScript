import { Currency } from '../../business/Currency';
import { ExchangeRateDto } from './ExchangeRateDto';

/**
 * Exchange rate history data
 */
export type ExchangeRateHistoryDto = ExchangeRateDto & {
    id: Currency;
};
