import { DataTypes } from '@etsoo/shared';
import enResources from './en.json';

/**
 * Get en neutral culture
 * @param localResources Local resources
 * @returns Full culture
 */
export const en = (localResources: object): DataTypes.CultureDefinition => ({
    name: 'en',
    label: 'English',
    resources: { ...enResources, ...localResources },
    compatibleNames: []
});
