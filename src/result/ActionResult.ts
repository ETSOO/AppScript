import { ApiError } from "@etsoo/restclient";
import { IActionResult, IResultData } from "./IActionResult";

/**
 * Action result
 */
export class ActionResult {
    /**
     * Create a result from error
     * @returns Action result interface
     */
    public static create<D extends IResultData = IResultData>(error: Error) {
        // If the error is ApiError, hold the status
        const status = error instanceof ApiError ? error.status : undefined;

        // Result
        const result: IActionResult<D> = {
            status,
            success: false,
            type: error.name,
            title: error.message
        };

        // Return
        return result;
    }
}