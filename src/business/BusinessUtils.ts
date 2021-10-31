import { DataTypes } from '@etsoo/shared';
import { IdLabelDto } from '../dto/IdLabelDto';
import { ICultureGet } from '../state/Culture';
import { EntityStatus } from './EntityStatus';
import { ProductUnit } from './ProductUnit';

/**
 * Business utils
 */
export namespace BusinessUtils {
    /**
     * Add blank item to id/label data array
     * @param input Input array
     * @param copy Copy or change the current inpu
     * @returns Items with blank item
     */
    export function addIdLabelBlankItem<T extends DataTypes.IdType = number>(
        input: IdLabelDto<T>[],
        copy: boolean = false
    ) {
        const blankItem: IdLabelDto<T> = { id: '' as any, label: '---' };
        if (copy) return [blankItem, ...input];

        input.unshift(blankItem);
        return input;
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param func Label delegate
     * @returns Label
     */
    export function getEntityStatusLabel(
        status: EntityStatus,
        func: ICultureGet
    ) {
        const key = EntityStatus[status];
        return func('status' + key) ?? key;
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'unitPC' for ProductUnit.PC like that
     * @param unit Unit
     * @param func Label delegate
     * @returns Label
     */
    export function getEntityStatus(func: ICultureGet) {
        return DataTypes.getEnumKeys(EntityStatus).map((key) => {
            const id = DataTypes.getEnumByKey(EntityStatus, key)!;
            return {
                id,
                label: getEntityStatusLabel(id, func)
            };
        });
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
        return func('unit' + key) ?? key;
    }

    /**
     * Get all product units
     * @param func Label delegate
     * @returns Units
     */
    export function getUnits(func: ICultureGet): IdLabelDto[] {
        return DataTypes.getEnumKeys(ProductUnit).map((key) => {
            const id = DataTypes.getEnumByKey(ProductUnit, key)!;
            return {
                id,
                label: getUnitLabel(id, func)
            };
        });
    }
}
