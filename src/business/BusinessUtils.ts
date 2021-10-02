import { Utils } from '@etsoo/shared';
import { IdLabelDto } from '../dto/IdLabelDto';
import { ICultureGet } from '../state/Culture';
import { ProductUnit } from './ProductUnit';

/**
 * Business utils
 */
export namespace BusinessUtils {
    // Get unit label by key
    function getUnitLabelByKey(func: ICultureGet, key: string) {
        return func('unit' + key) ?? key;
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param func Label delegate
     * @returns Label
     */
    export function getUnitLabel(unit: ProductUnit, func: ICultureGet) {
        const key = ProductUnit[unit];
        return getUnitLabelByKey(func, key);
    }

    /**
     * Get all product units
     * @param func Label delegate
     * @returns Units
     */
    export function getUnits(func: ICultureGet): IdLabelDto[] {
        return Utils.getEnumKeys(ProductUnit).map((key) => ({
            id: ProductUnit[key as keyof typeof ProductUnit],
            label: getUnitLabelByKey(func, key)
        }));
    }
}
