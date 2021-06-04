import { IActionResult } from './IActionResult';

/**
 * Refresh token result
 */
export type RefreshTokenResult = IActionResult<{
    token: string;
}>;
