import { CultureUtils } from './CultureUtils';

/**
 * Get zh-Hans neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHans = (...resources: (object | (() => Promise<object>))[]) =>
    CultureUtils.make(import('./zh-Hans.json'), ...resources);
