import { RepeatOption } from './RepeatOption';

/**
 * Product base units
 * 1 - 9
 */
export enum ProductBaseUnit {
    /**
     * Picese
     * 件
     */
    PC = 1,

    /**
     * Set
     * 套
     */
    SET = 2
}

/**
 * Product weight units
 * Range 40 - 49
 */
export enum ProductWeightUnit {
    /**
     * Gram
     * 克
     */
    GRAM = 40,

    /**
     * Half Kg
     * 斤
     */
    JIN = 41,

    /**
     * Kilogram
     * 千克
     */
    KILOGRAM = 42,

    /**
     * Ton
     * 吨
     */
    TON = 49
}

/**
 * Product units enum
 * Repeat options take range 10 - 39
 * @see com.etsoo.CoreFramework.Business.ProductUnit
 */
export const ProductUnit = {
    ...ProductBaseUnit,
    ...RepeatOption,
    ...ProductWeightUnit
};
export type ProductUnit = ProductBaseUnit | RepeatOption | ProductWeightUnit;
