import { DataTypes } from '@etsoo/shared';
import enUSResources from './en-US.json';

/**
 * Get en-US cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const enUS = (localResources: object): DataTypes.CultureDefinition => ({
    name: 'en-US',
    label: 'English',
    resources: { ...enUSResources, ...localResources },
    compatibleName: ['en-CA', 'en-AU', 'en-NZ', 'en-GB', 'en-IE']
});
