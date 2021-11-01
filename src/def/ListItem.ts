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
     * Action, string for URL
     */
    action?: string | (() => PromiseLike<void> | void);
};
