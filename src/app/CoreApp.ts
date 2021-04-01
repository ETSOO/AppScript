import { INotifier } from '@etsoo/notificationbase';
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
     * Notifier
     */
    public readonly notifier: INotifier<N>;

    /**
     * Search input element
     */
    public searchInput?: HTMLInputElement;

    /**
     * Protected constructor
     * @param settings Settings
     * @param api API
     * @param notifier Notifier
     */
    protected constructor(settings: S, api: IApi, notifier: INotifier<N>) {
        this.settings = settings;
        this.api = api;
        this.notifier = notifier;
    }

    /**
     * Get label
     * @param name Label name
     */
    public getLabel(name: string) {
        return this.settings.currentLanguage.labels[name] ?? name;
    }
}
