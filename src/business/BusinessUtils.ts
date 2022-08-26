import { DataTypes, ListType, ListType1 } from '@etsoo/shared';
import { ICultureGet } from '../state/Culture';
import { ProductUnit } from './ProductUnit';
import { RepeatOption } from './RepeatOption';

/**
 * Business utils
 */
export namespace BusinessUtils {
    /**
     * Format avatar title
     * @param title Title
     * @param maxChars Max characters
     * @param defaultTitle Default title
     * @returns Result
     */
    export function formatAvatarTitle(
        title?: string,
        maxChars: number = 3,
        defaultTitle: string = 'ME'
    ): string {
        // Just return for empty cases
        if (title == null || title === '') return defaultTitle;

        // split with words
        const items = title.trim().split(/\s+/g);

        if (items.length === 1) {
            // 2-3 Chinese names
            const titleLen = title.length;
            if (titleLen <= maxChars) return title.toUpperCase();

            // Return default for simplicity
            return defaultTitle;
        }

        // First letter of each item
        var firstLetters = items
            .map((item) => item[0])
            .join('')
            .toUpperCase();

        const flen = firstLetters.length;
        if (flen <= maxChars) return firstLetters;

        return defaultTitle;
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
    ): ListType1[] {
        return currencyNames.map((name) => ({
            id: name,
            label: func(`currency${name}`) ?? name
        }));
    }

    /**
     * Get 12-month items
     * @param monthLabels Month labels
     * @param startMonth Start month, 0 as Jan.
     * @returns 12 months
     */
    export function getMonths(monthLabels: string[], startMonth: number = 0) {
        const months: ListType[] = [];

        for (let i = 0; i < 12; i++) {
            if (startMonth >= 12) startMonth = 0;

            months.push({ id: startMonth, label: monthLabels[startMonth] });

            startMonth++;
        }

        return months;
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
    export function getUnits(func: ICultureGet): ListType[];

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
    ): ListType[];

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
    ): ListType[] {
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
    ): ListType[] {
        options ??= DataTypes.getEnumKeys(RepeatOption);
        isJoined ??= true;

        return getUnits(func, options, isJoined);
    }

    /**
     * Set id value
     * @param item QueryRQ or TiplistRQ or similiar item
     * @param id Id value
     */
    export function setIdValue<T extends { id?: number; sid?: string }>(
        item: T,
        id?: DataTypes.IdType
    ) {
        if (id == null) return;
        if (typeof id === 'number') item.id = id;
        else item.sid = id;
    }
}
