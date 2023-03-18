import { IActionResult } from './IActionResult';

/**
 * Action result error
 */
export class ActionResultError extends Error {
    /**
     * Format the result to a meaningful string
     * @param result Result
     */
    static format(result: IActionResult) {
        // Additional data
        const addtions = [];
        if (result.status != null) addtions.push(result.status);
        if (result.type) addtions.push(result.type);
        if (result.field) addtions.push(result.field);

        const add = addtions.length > 0 ? ` (${addtions.join(', ')})` : '';
        let title = result.title;
        if (title && result.traceId) {
            title += ` [${result.traceId}]`;
        }

        return `${title || 'Error'}${add}`;
    }

    /**
     * Related result
     */
    readonly result: IActionResult;

    /**
     * Constructor
     * @param result Result
     */
    constructor(result: IActionResult) {
        // Super
        super(ActionResultError.format(result));

        // Name
        this.name = 'ActionResultError';

        // Hold the result
        this.result = result;
    }
}
