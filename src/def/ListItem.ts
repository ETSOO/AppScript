/**
 * List item definition
 */
export type ListItem<T> = {
    /**
     * Label, '-' for divider
     */
    label: string;

    /**
     * Icon
     */
    icon?: T;

    /**
     * Action, string for URL, any for state
     */
    action?: string | [string, any] | (() => PromiseLike<void> | void);
};
