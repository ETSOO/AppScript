import { IApp } from '../app/IApp';

/**
 * SmartERP base API
 */
export class BaseApi<T extends IApp = IApp> {
    /**
     * Constructor
     * @param app Application
     * @param api API
     */
    constructor(protected app: T, protected api = app.api) {}
}
