/**
 * Dto with id field
 */
export type IdDto<T = number> = {
    /**
     * Id
     */
    readonly id: T;
};
