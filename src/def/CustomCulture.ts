/**
 * Custom culture
 */
export type CustomCulture = {
  /**
   * Target id
   */
  id: string;

  /**
   * Culture, like zh-Hans
   */
  culture: string;

  /**
   * Organization id
   */
  organizationId?: number;

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
   * Use Utils.parseString of @etsoo/shared to parse the string to JSON object
   */
  jsonData?: string;
};
