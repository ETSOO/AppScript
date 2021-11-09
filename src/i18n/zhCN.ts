import { DataTypes } from '@etsoo/shared';
import zhCNResources from './zh-CN.json';

/**
 * zh-CN cultrue
 */
export const zhCN: DataTypes.CultureDefinition = {
    name: 'zh-CN',
    label: '简体中文',
    resources: zhCNResources,
    compatibleName: ['zh-SG']
};
