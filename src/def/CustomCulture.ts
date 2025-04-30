/**
 * Custom culture data
 */
export type CustomCultureData = {
  /**
   * Key
   */
  key: string;

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

/**
 * Custom culture
 */
export type CustomCulture = CustomCultureData & {
  /**
   * Culture, like zh-Hans
   */
  culture: string;
};
