/**
 * Result data
 * Indexable type
 */
export interface IResultData {
    readonly [key: string]: any;
}

/**
 * Result data with id, follow this style to extend for specific model
 */
export interface IdResultData extends IResultData {
    /**
     * Id
     */
    id: number | string;
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
    type: string;

    /**
     * Success or not
     */
    readonly ok: boolean;
}

/**
 * Action result with id data
 */
export type ActionResultId = IActionResult<IdResultData>;
