import { DataTypes, DomUtils } from '@etsoo/shared';

/**
 * Get zh-Hant neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHant = (resources: object | (() => Promise<object>)) =>
    DomUtils.en(async () => {
        const [r1, r2] = await Promise.all([
            import('./zh-Hant.json'),
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
