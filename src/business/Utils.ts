import { ICultureGet } from '../state/Culture';
import { ProductUnit } from './ProductUnit';

/**
 * Business utils
 */
export namespace Utils {
    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param func Label delegate
     * @returns Label
     */
    export function getUnitLabel(unit: ProductUnit, func: ICultureGet) {
        const key = ProductUnit[unit];
        return func('unit' + key) ?? key;
    }
}
