import { CultureUtils } from './CultureUtils';

/**
 * Get zh-Hant neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHant = (...resources: (object | (() => Promise<object>))[]) =>
    CultureUtils.make(import('./zh-Hant.json'), ...resources);
