import { DataTypes } from '@etsoo/shared';

export type i18nResource = object | (() => Promise<object>);

export function i18nResourceCreator(file: string, resources: i18nResource) {
    return async () => {
        const [r1, r2] = await Promise.all([
            import(file),
            new Promise<object>((resolve) => {
                if (typeof resources === 'object') {
                    resolve(resources);
                } else {
                    resources().then((result) => resolve(result));
                }
            })
        ]);
        return { ...r1, ...r2 } as DataTypes.StringRecord;
    };
}
