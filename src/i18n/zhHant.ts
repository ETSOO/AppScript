import { DataTypes } from '@etsoo/shared';
import zhHantResources from './zh-Hant.json';

/**
 * Get zh-Hant neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHant = (
    localResources: object
): DataTypes.CultureDefinition => ({
    name: 'zh-Hant',
    label: '繁體中文',
    resources: { ...zhHantResources, ...localResources },
    compatibleNames: ['zh-HK', 'zh-TW', 'zh-MO']
});
