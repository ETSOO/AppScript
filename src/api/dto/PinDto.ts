/**
 * Pin data
 * 身份证信息
 */
export type PinDto = {
  /**
   * Region id
   * 地区编号
   */
  regionId?: string;

  /**
   * State or province
   * 州 / 省
   */
  state?: string;

  /**
   * State or province id
   * 州 / 省编号
   */
  stateId?: string;

  /**
   * City
   * 城市
   */
  city?: string;

  /**
   * City id
   * 城市编号
   */
  cityId?: number;

  /**
   * District
   * 区县
   */
  district?: string;

  /**
   * District id
   * 区县编号
   */
  districtId?: number;

  /**
   * Merged previous district
   * 合并的原区县
   */
  mergedDistrict?: string;

  /**
   * Gender
   * 性别
   */
  gender?: "F" | "M";

  /**
   * Birthday
   * 生日
   */
  birthday?: string | Date;

  /**
   * Whether the form is legal
   * 是否形式合法
   */
  valid: boolean;
};
