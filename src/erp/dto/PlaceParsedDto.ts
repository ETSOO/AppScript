/**
 * Parsed place data
 */
export type PlaceParsedDto = {
    /**
     * Language
     * 语言
     */
    language: string;

    /**
     * Region or country name, like China
     * 地区或国家名称，如中国
     */
    region?: string;

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
};
