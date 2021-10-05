import { Utils } from '@etsoo/shared';
import { IdLabelDto } from '../dto/IdLabelDto';
import { ICultureGet } from '../state/Culture';
import { AddressContinent } from './AddressContinent';

/**
 * Address utils
 */
export namespace AddressUtils {
    /**
     * Get all continents
     * @param func Label delegate
     * @param isNumberKey Is number key or key as id
     * @returns Continents
     */
    export function getContinents(
        func: ICultureGet,
        isNumberKey: boolean = false
    ): IdLabelDto[] {
        return Utils.getEnumKeys(AddressContinent).map((key) => ({
            id: isNumberKey
                ? AddressContinent[key as keyof typeof AddressContinent]
                : key,
            label: func('continent' + key) ?? key
        }));
    }
}
