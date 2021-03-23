/**
 * IBridge unsubscribe type
 */
type IBridgeUnsubscribe = () => void;

/**
 * IBridge subscribe listener type
 */
type IBridgeListener = (...args: any[]) => void;

/**
 * window.external calls bridge interface
 */
export interface IBridge {
    /**
     * Send data to the host process with an unique channel
     * @param channel an unique channel
     * @param data Data to send
     */
    send(channel: string, data?: any): void;

    /**
     * Subscribe to the host process
     * @param channel an unique channel
     * @param listener callback listener
     */
    subscribe(channel: string, listener: IBridgeListener): IBridgeUnsubscribe;
}
