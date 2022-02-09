import { DataTypes } from '@etsoo/shared';

/**
 * Result data
 * Indexable type
 */
export interface IResultData {
    readonly [key: string]: unknown;
}

/**
 * Result errors
 * Indexable type
 */
export interface IResultErrors {
    readonly [key: string]: string[];
}

/**
 * Operation result interface
 */
export interface IActionResult<D extends IResultData = IResultData> {
    /**
     * Status code
     */
    readonly status?: number;

    /**
     * Result data
     */
    readonly data?: D;

    /**
     * Result errors
     */
    readonly errors?: IResultErrors;

    /**
     * Title
     */
    title?: string;

    /**
     * Detail
     */
    detail?: string;

    /**
     * Trace id
     */
    traceId?: string;

    /**
     * Type
     */
    type?: string;

    /**
     * Field name
     */
    field?: string;

    /**
     * Success or not
     */
    readonly ok: boolean;
}

/**
 * Action result with id data
 */
export type IdActionResult<T extends DataTypes.IdType = number> =
    IActionResult<{
        id: T;
    }>;
