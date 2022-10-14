/**
 * Currency array
 */
export const Currencies = [
    'AUD',
    'CAD',
    'CNY',
    'EUR',
    'GBP',
    'HKD',
    'JPY',
    'NZD',
    'SGD',
    'USD'
] as const;

/**
 * Currency type
 */
export type Currency = typeof Currencies[number];
