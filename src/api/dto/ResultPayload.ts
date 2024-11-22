import { IApiPayload } from "@etsoo/restclient";
import {
  IActionResult,
  IdActionResult,
  IdMsgActionResult,
  MsgActionResult
} from "@etsoo/shared";

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

/**
 * Id and message action result payload
 */
export type IdMsgResultPayload = IApiPayload<IdMsgActionResult>;

/**
 * Message action result payload
 */
export type MsgResultPayload = IApiPayload<MsgActionResult>;
