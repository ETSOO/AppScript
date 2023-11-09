import { IApiPayload } from '@etsoo/restclient';
import { IActionResult, IdActionResult } from '@etsoo/shared';

/**
 * Action result payload
 */
export type ResultPayload = IApiPayload<IActionResult>;

/**
 * Number id action result payload
 */
export type IdResultPayload = IApiPayload<IdActionResult>;

/**
 * String id action result payload
 */
export type StringIdResultPayload = IApiPayload<IdActionResult<string>>;
