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
        var addtions = [];
        if (result.status != null) addtions.push(result.status);
        if (result.type) addtions.push(result.type);
        if (result.field) addtions.push(result.field);

        var add = addtions.length > 0 ? ` (${addtions.join(', ')})` : '';

        return `${result.title || 'Error'}${add}`;
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
