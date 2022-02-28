import { ExtendUtils } from '@etsoo/shared';
import { IBridgeHost } from './IBridgeHost';

// Call handler type
type CallHandlerType = (
    name: string,
    ...args: unknown[]
) => PromiseLike<Record<string, unknown> | void>;

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
     * Cached commands
     */
    private cachedCommands: Record<string, unknown[]> = {};

    /**
     * Constructor
     * @param callHandler Call handler
     */
    constructor(private host: { callHandler?: CallHandlerType }) {
        window.addEventListener(
            'flutterInAppWebViewPlatformReady',
            (_event) => {
                if (this.host.callHandler == null) return;

                for (const key in this.cachedCommands) {
                    // Args
                    const args = this.cachedCommands[key];

                    // Execute
                    this.host.callHandler(key, ...args);

                    // Remove the key
                    delete this.cachedCommands[key];
                }
            }
        );
    }

    cacheCommand(name: string, ...args: unknown[]): void {
        this.cachedCommands[name] = args;
    }

    changeCulture(locale: string): void {
        if (this.host.callHandler)
            this.host.callHandler('changeCulture', locale);
        else this.cacheCommand('changeCulture', locale);
    }

    closable(): boolean {
        return false;
    }

    exit(): void {
        if (this.host.callHandler) this.host.callHandler('exit');
        else this.cacheCommand('exit');
    }

    async getLabels<T extends string>(...keys: T[]) {
        // Try 500 miliseconds
        let count = 5;
        while (this.host.callHandler == null) {
            count--;
            await ExtendUtils.sleep(100);

            if (count === 0) break;
        }

        const init: any = {};

        if (this.host.callHandler == null) return init;

        const result = (await this.host.callHandler('getLabels')) ?? {};

        return keys.reduce(
            (a, v) => ({
                ...a,
                [v]: result[v] ?? ''
            }),
            init
        );
    }

    getStartUrl(): string | null | undefined {
        return this.startUrl;
    }

    loadApp(name: string, startUrl?: string): void {
        this.startUrl = startUrl;
        if (this.host.callHandler)
            this.host.callHandler('loadApp', name, startUrl);
        else this.cacheCommand('loadApp', name, startUrl);
    }

    userAuthorization(authorized: boolean): void {
        if (this.host.callHandler)
            this.host.callHandler('userAuthorization', authorized);
        else this.cacheCommand('userAuthorization', authorized);
    }

    onUpdate(func: (app: string, version: string) => void) {}
}
