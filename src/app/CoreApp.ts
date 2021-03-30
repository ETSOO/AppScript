import { INotification } from '@etsoo/notificationbase';
import { IApi } from '@etsoo/restclient';
import { IAppSettings } from './AppSettings';

/**
 * Core application
 */
export abstract class CoreApp<S extends IAppSettings, N> {
    /**
     * Settings
     */
    public readonly settings: S;

    /**
     * API
     */
    public readonly api: IApi;

    /**
     * Notification
     */
    public readonly notification: INotification<N>;

    /**
     * Search input element
     */
    public searchInput?: HTMLInputElement;

    /**
     * Protected constructor
     * @param settings Settings
     * @param api API
     * @param notification Notification
     */
    protected constructor(
        settings: S,
        api: IApi,
        notification: INotification<N>
    ) {
        this.settings = settings;
        this.api = api;
        this.notification = notification;
    }

    /**
     * Get label
     * @param name Label name
     */
    public getLabel(name: string) {
        return this.settings.currentLanguage.labels[name] ?? name;
    }
}
