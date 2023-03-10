import { AddressLocation } from '../../address/AddressLocation';

/**
 * Place query output type
 * 地址查询输出类型
 */
export enum PlaceQueryOutput {
    JSON,
    XML
}

/**
 * Place query API provider
 * 地址查询接口供应商
 */
export enum PlaceQueryProvider {
    Google,
    Baidu
}

/**
 * Place query request data
 * 地址查询请求数据
 */
export type PlaceQueryRQ = {
    /**
     * Query address
     * 查询地址
     */
    query: string;

    /**
     * Output type
     * 输出类型
     */
    output?: PlaceQueryOutput;

    /**
     * API provider
     * 接口供应商
     */
    provider?: PlaceQueryProvider;

    /**
     * Language
     * 语言
     */
    language?: string;

    /**
     * Limited region / country id, like CN
     * 限定的地区获国家编号
     */
    region?: string;

    /**
     * Center location
     * 中心位置
     */
    location?: AddressLocation;

    /**
     * Circle radius
     * 方圆半径
     */
    radius?: number;
};
