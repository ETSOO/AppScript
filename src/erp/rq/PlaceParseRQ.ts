/**
 * Parse place request data
 */
export type PlaceParseRQ = {
    /**
     * Region or country name, like China
     * 地区或国家名称，如中国
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
};
