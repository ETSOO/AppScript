import { DataTypes } from '@etsoo/shared';
import zhCNResources from './zh-CN.json';

/**
 * Get zh-CN cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhCN = (localResources: {}): DataTypes.CultureDefinition => ({
    name: 'zh-CN',
    label: '简体中文',
    resources: { ...zhCNResources, ...localResources },
    compatibleName: ['zh-SG']
});
