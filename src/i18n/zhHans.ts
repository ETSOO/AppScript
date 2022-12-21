import { DataTypes } from '@etsoo/shared';
import zhHansResources from './zh-Hans.json';

/**
 * Get zh-Hans neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHans = (localResources: {}): DataTypes.CultureDefinition => ({
    name: 'zh-Hans',
    label: '简体中文',
    resources: { ...zhHansResources, ...localResources },
    compatibleNames: ['zh-CN', 'zh-SG']
});
