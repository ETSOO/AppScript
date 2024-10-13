import { DataTypes, DomUtils } from '@etsoo/shared';

/**
 * Culture utilities
 */
export namespace CultureUtils {
    /**
     * Make culture
     * @param resources Resources
     * @returns Culture
     */
    export function make(...resources: (object | (() => Promise<object>))[]) {
        return DomUtils.zhHans(async () => {
            const rs = await Promise.all(
                resources.map(
                    (resource) =>
                        new Promise<object>((resolve) => {
                            if (typeof resource === 'object') {
                                resolve(resource);
                            } else {
                                resource().then((result) => resolve(result));
                            }
                        })
                )
            );
            return rs.reduce((prev, curr) => ({
                ...prev,
                ...curr
            })) as DataTypes.StringRecord;
        });
    }
}
