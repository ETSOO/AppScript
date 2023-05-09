import { DataTypes, DomUtils } from '@etsoo/shared';

/**
 * Get en neutral culture
 * @param localResources Local resources
 * @returns Full culture
 */
export const en = (resources: object | (() => Promise<object>)) =>
    DomUtils.en(async () => {
        const [r1, r2] = await Promise.all([
            import('./en.json'),
            new Promise<object>((resolve) => {
                if (typeof resources === 'object') {
                    resolve(resources);
                } else {
                    resources().then((result) => resolve(result));
                }
            })
        ]);
        return { ...r1, ...r2 } as DataTypes.StringRecord;
    });
