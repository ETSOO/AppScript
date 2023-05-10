import { DataTypes, DomUtils } from '@etsoo/shared';

/**
 * Get zh-Hans neutral cultrue
 * @param localResources Local resources
 * @returns Full culture
 */
export const zhHans = (resources: object | (() => Promise<object>)) =>
    DomUtils.zhHans(async () => {
        const [r1, r2] = await Promise.all([
            import('./zh-Hans.json'),
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
