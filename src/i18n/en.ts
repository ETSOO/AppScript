import { DomUtils } from '@etsoo/shared';
import { i18nResource, i18nResourceCreator } from './i18nResources';

/**
 * Get en neutral culture
 * @param localResources Local resources
 * @returns Full culture
 */
export const en = (resources: i18nResource) =>
    DomUtils.en(i18nResourceCreator('./en.json', resources));
