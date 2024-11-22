import { AddressLocation } from "./AddressLocation";

/**
 * Address place base
 * 基础地点
 */
export type AddressPlaceBase = {
  /**
   * Location
   * 位置
   */
  location?: AddressLocation;

  /**
   * Region or country, like CN = China
   * 地区或国家，比如 CN 表示中国
   */
  region?: string;

  /**
   * State or province
   * 州 / 省
   */
  state?: string;

  /**
   * City
   * 城市
   */
  city?: string;

  /**
   * District
   * 区县
   */
  district?: string;

  /**
   * Postcode
   * 邮编
   */
  postcode?: string;
};
