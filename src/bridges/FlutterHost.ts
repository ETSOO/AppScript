import { IBridgeHost } from './IBridgeHost';

/**
 * Flutter JavaScript Host
 * https://inappwebview.dev/docs/javascript/communication/
 */
export class FlutterHost implements IBridgeHost {
    /**
     * Start Url
     */
    private startUrl: string | null | undefined;

    /**
     * Constructor
     * @param callHandler Call handler
     */
    constructor(
        public callHandler: (
            name: string,
            ...args: unknown[]
        ) => PromiseLike<{} | void>
    ) {}

    changeCulture(locale: string): void {
        this.callHandler('changeCulture', locale);
    }

    exit(): void {
        this.callHandler('exit');
    }

    getStartUrl(): string | null | undefined {
        return this.startUrl;
    }

    loadApp(name: string, startUrl?: string): void {
        this.startUrl = startUrl;
        this.callHandler('loadApp', name, startUrl);
    }
}
