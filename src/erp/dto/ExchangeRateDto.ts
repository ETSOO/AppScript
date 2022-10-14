/**
 * Exchange rate data
 */
export type ExchangeRateDto = {
    /**
     * Exchange rate
     */
    exchangeRate: number;

    /**
     * Update time
     */
    updateTime: string | Date;
};
