/**
 * Parse PIN request data
 * 解析证件号码请求数据
 */
export type ParsePinRQ = {
    /**
     * Pin
     */
    pin: string;

    /**
     * Language
     */
    language?: string;
};
