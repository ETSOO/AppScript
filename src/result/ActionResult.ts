import { ApiError } from '@etsoo/restclient';
import { IActionResult } from './IActionResult';

/**
 * Action result
 */
export class ActionResult {
    /**
     * Create a result from error
     * @returns Action result interface
     */
    static create<D extends {} = {}>(error: Error) {
        // If the error is ApiError, hold the status
        const status = error instanceof ApiError ? error.status : undefined;

        // Result
        const result: IActionResult<D> = {
            status,
            ok: false,
            type: error.name,
            title: error.message
        };

        // Return
        return result;
    }
}
