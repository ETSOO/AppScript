import { FlutterHost } from './FlutterHost';
import { IBridgeHost } from './IBridgeHost';

/**
 * Bridge utils
 */
export namespace BridgeUtils {
    const g: any = globalThis;

    /**
     * Bridge host
     */
    export const host =
        typeof g.flutter_inappwebview?.callHandler === 'function'
            ? new FlutterHost(g.flutter_inappwebview.callHandler)
            : typeof g.electron === 'object'
            ? (g.electron as IBridgeHost)
            : undefined;
}
