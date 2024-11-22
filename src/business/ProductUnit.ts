import { RepeatOption } from "./RepeatOption";

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

enum ProductAssetUnit {
  /**
   * Time
   * 次
   */
  TIME = 99,

  /**
   * Money
   * 储值
   */
  MONEY = 100
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
 * Product other units
 */
export enum ProductOtherUnit {
  /**
   * Cubic meter
   * 立方米
   */
  M3 = 50
}

/**
 * Product units enum
 * Repeat options take range 10 - 39
 * @see com.etsoo.CoreFramework.Business.ProductUnit
 */
export const ProductUnit = {
  ...ProductBaseUnit,
  ...RepeatOption,
  ...ProductAssetUnit,
  ...ProductWeightUnit,
  ...ProductOtherUnit
};
export type ProductUnit =
  | ProductBaseUnit
  | RepeatOption
  | ProductAssetUnit
  | ProductWeightUnit
  | ProductOtherUnit;

/**
 * Product asset units enum
 */
export const AssetUnits = {
  ...RepeatOption,
  ...ProductAssetUnit
};
export type AssetUnits = RepeatOption | ProductAssetUnit;
