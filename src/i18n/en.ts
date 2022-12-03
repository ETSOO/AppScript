import { DataTypes } from '@etsoo/shared';
import enUSResources from './en.json';

/**
 * Get en neutral culture
 * @param localResources Local resources
 * @returns Full culture
 */
export const en = (localResources: object): DataTypes.CultureDefinition => ({
    name: 'en',
    label: 'English',
    resources: { ...enUSResources, ...localResources },
    compatibleNames: []
});
