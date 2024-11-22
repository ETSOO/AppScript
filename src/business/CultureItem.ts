/**
 * Culture item for multilingual labels
 */
export type CultureItem = {
  /**
   * Target id
   */
  id: number;

  /**
   * Culture, like zh-Hans
   */
  culture: string;

  /**
   * Title /  label
   */
  title: string;

  /**
   * Description
   */
  description?: string;

  /**
   * JSON data related
   */
  jsonData?: string;
};

/**
 * Culture grid item for editing
 */
export type CultureGridItem = {
  /**
   * Culture
   */
  id: string;

  /**
   * Title /  label
   */
  title: string;

  /**
   * Description
   */
  description?: string;

  /**
   * JSON data related
   */
  jsonData?: string;
};
