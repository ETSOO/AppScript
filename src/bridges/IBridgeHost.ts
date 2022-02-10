/**
 * Bridge host
 */
export interface IBridgeHost {
    /**
     * Change culture
     * @param locale Locale
     */
    changeCulture(locale: string): void;

    /**
     * Exit the application
     */
    exit(): void;

    /**
     * Load application
     * @param name App name
     * @param startUrl Start Url
     */
    loadApp(name: string, startUrl?: string): void;
}
