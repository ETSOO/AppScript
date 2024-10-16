import { DataTypes, DomUtils } from '@etsoo/shared';

/**
 * Culture utilities
 */
export namespace CultureUtils {
    /**
     * Make culture
     * @param cultureMaker Culture maker
     * @param resources Resources
     * @returns Culture
     */
    export function make(
        cultureMaker: typeof DomUtils.zhHans,
        ...resources: (object | (() => Promise<object>))[]
    ) {
        return cultureMaker(async () => {
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
