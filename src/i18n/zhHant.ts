import { DomUtils } from '@etsoo/shared';
import { i18nResource, i18nResourceCreator } from './i18nResources';

/**
 * Get zh-Hant neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHant = (resources: i18nResource) =>
    DomUtils.en(i18nResourceCreator('./zh-Hant.json', resources));
