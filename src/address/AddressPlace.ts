import { AddressLocation } from './AddressLocation';
import { AddressPlaceBase } from './AddressPlaceBase';

/**
 * Address place
 * 地点
 */
export type AddressPlace = Omit<AddressPlaceBase, 'location'> & {
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
     * Location
     * 位置
     */
    location: AddressLocation;

    /**
     * Formatted address
     * 格式化地址
     */
    formattedAddress: string;
};
