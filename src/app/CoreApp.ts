import { IApi } from "@etsoo/restclient";
import { IAppSettings } from "./AppSettings";
import { ICoreApp } from "./ICoreApp";
import { INotification } from "./Notification";

/**
 * Core application
 */
export abstract class CoreApp<S extends IAppSettings> implements ICoreApp {
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
    public readonly notification: INotification;

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
    protected constructor(settings: S, api: IApi, notification: INotification) {
        this.settings = settings;
        this.api = api;
        this.notification = notification;
    }

    /**
     * Get label
     * @param name Label name
     */
    public getLabel(name: string)
    {
        return this.settings.currentLanguage.labels[name] ?? name;
    }
}