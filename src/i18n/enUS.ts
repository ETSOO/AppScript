import { DataTypes } from '@etsoo/shared';
import enUSResources from './en-US.json';

/**
 * en-US cultrue
 */
export const enUS: DataTypes.CultureDefinition = {
    name: 'en-US',
    label: 'English',
    resources: enUSResources,
    compatibleName: ['en-CA', 'en-AU', 'en-NZ', 'en-GB', 'en-IE']
};
