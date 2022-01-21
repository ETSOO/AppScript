import { DataTypes } from '@etsoo/shared';
import { RepeatOption } from '..';
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
     * Get currency collection
     * @param currencyNames Names like CNY, USD
     * @param func Label delegate
     * @returns Collection
     */
    export function getCurrencies(
        currencyNames: string[],
        func: ICultureGet
    ): IdLabelDto<string>[] {
        return currencyNames.map((name) => ({
            id: name,
            label: func(`currency${name}`) ?? name
        }));
    }

    /**
     * Get product unit's label
     * Please define the label in culture with key 'statusNormal' for Normal status
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
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Label
     */
    export function getUnitLabel(
        unit: ProductUnit,
        func: ICultureGet,
        isJoined?: boolean
    ) {
        const key = ProductUnit[unit];
        const label = func('unit' + key) ?? key;
        if (isJoined) {
            const jLabel = func('unitJoin');
            if (jLabel) return jLabel.format(label);
        }
        return label;
    }

    /**
     * Get all product units
     * @param func Label delegate
     * @returns Units
     */
    export function getUnits(func: ICultureGet): IdLabelDto[];

    /**
     *
     * Get all product units
     * @param func Label delegate
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    export function getUnits(
        func: ICultureGet,
        options?: string[],
        isJoined?: boolean
    ): IdLabelDto[];

    /**
     *
     * Get all product units
     * @param func Label delegate
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    export function getUnits(
        func: ICultureGet,
        options?: string[],
        isJoined?: boolean
    ): IdLabelDto[] {
        options ??= DataTypes.getEnumKeys(ProductUnit);
        return options.map((key) => {
            const id = DataTypes.getEnumByKey(ProductUnit, key)! as number;
            return {
                id,
                label: getUnitLabel(id, func, isJoined).formatInitial(true)
            };
        });
    }

    /**
     *
     * Get all repeat options
     * @param func Label delegate
     * @param options Define the order and limit the items
     * @param isJoined Add the join label like 'per Kg' for Kg
     * @returns Units
     */
    export function getRepeatOptions(
        func: ICultureGet,
        options?: string[],
        isJoined: boolean = true
    ): IdLabelDto[] {
        options ??= DataTypes.getEnumKeys(RepeatOption);
        isJoined ??= true;

        return getUnits(func, options, isJoined);
    }
}
