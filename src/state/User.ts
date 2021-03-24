import { DataTypes } from "@etsoo/shared";
import { IState } from "./State";

/**
 * User data interface
 */
export interface IUserData {
    /**
     * User id
     */
    readonly id: DataTypes.IdType;

    /**
     * User name
     */
    readonly name: string;

    /**
     * Organization id
     */
    readonly organization?: number;

    /**
     * Refresh seconds
     */
    readonly seconds: number;

    /**
     * Access token
     */
    readonly token:string;

    /**
     * User universal id
     */
    readonly uid?: DataTypes.IdType;
}

/**
 * User interface
 */
export interface IUser extends IUserData, IState {
    /**
     * Authorized or not
     */
     authorized: boolean;
}