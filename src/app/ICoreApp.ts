import { IApi } from "@etsoo/restclient";
import { IAppSettings } from "./AppSettings";
import { INotification } from "./Notification";

/**
 * Core application interface
 */
export interface ICoreApp {
    /**
     * Settings
     */
    readonly settings: IAppSettings;

    /**
     * API
     */
    readonly api: IApi;

    /**
     * Notification
     */
    readonly notification: INotification;

    /**
     * Search input element
     */
    searchInput?: HTMLInputElement;

    /**
     * Get label
     * @param name Label name
     */
    getLabel(name: string): string;
}