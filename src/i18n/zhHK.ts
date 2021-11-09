import { DataTypes } from '@etsoo/shared';
import zhHKResources from './zh-HK.json';

/**
 * Get zh-HK cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHK = (localResources: {}): DataTypes.CultureDefinition => ({
    name: 'zh-HK',
    label: '繁體中文',
    resources: { ...zhHKResources, ...localResources },
    compatibleName: ['zh-TW', 'zh-MO']
});
