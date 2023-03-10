import { AddressPlaceBase } from './AddressPlaceBase';

/**
 * Address autocomplete
 * 地点自动填充
 */
export type AddressAutocomplete = {
    /**
     * Place id
     * 地点编号
     */
    placeId: string;

    /**
     * Name
     * 名称
     */
    name: string;

    /**
     * Place data
     * 地点数据
     */
    place?: AddressPlaceBase;
};
