import { CultureUtils } from './CultureUtils';

/**
 * Get en neutral culture
 * @param localResources Local resources
 * @returns Full culture
 */
export const en = (...resources: (object | (() => Promise<object>))[]) =>
    CultureUtils.make(import('./en.json'), ...resources);
