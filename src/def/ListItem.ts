/**
 * List item definition
 */
export type ListItem<T, E = any> = {
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
  action?: string | [string, any] | ((event: E) => PromiseLike<void> | void);
};
