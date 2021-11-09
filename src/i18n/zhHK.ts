import { DataTypes } from '@etsoo/shared';
import zhHKResources from './zh-HK.json';

/**
 * zh-HK cultrue
 */
export const zhHK: DataTypes.CultureDefinition = {
    name: 'zh-HK',
    label: '繁體中文',
    resources: zhHKResources,
    compatibleName: ['zh-TW', 'zh-MO']
};
