import { ListType } from '@etsoo/shared';
import { IApp } from '../app/IApp';

/**
 * Organization API
 */
export class OrgApi {
    /**
     * Constructor
     * @param app Application
     */
    constructor(private app: IApp) {}

    /**
     * Get organization list
     * @param items Max items
     * @param serviceId Service id
     * @returns Result
     */
    list(items?: number, serviceId?: number) {
        return this.app.api.post<ListType[]>(
            'Organization/List',
            {
                items,
                serviceId
            },
            { defaultValue: [], showLoading: false }
        );
    }

    /**
     * Switch organization
     * @param id Organization id
     * @param serviceId Service id
     */
    async switch(id: number, serviceId?: number) {
        const result = await this.app.api.put<boolean>('Organization/Switch', {
            id,
            serviceId,
            deviceId: this.app.deviceId
        });
        if (result) return await this.app.refreshToken();
        return result;
    }
}
