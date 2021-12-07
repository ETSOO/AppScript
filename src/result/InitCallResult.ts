import { IActionResult, IResultData } from './IActionResult';

/**
 * Result data with id, follow this style to extend for specific model
 */
export interface InitCallResultData extends IResultData {
    /**
     * Secret passphrase
     */
    passphrase: string;

    /**
     * Actual seconds gap
     */
    seconds: number;

    /**
     * Valid seconds gap
     */
    validSeconds: number;
}

/**
 * Init call result
 */
export type InitCallResult = IActionResult<InitCallResultData>;
