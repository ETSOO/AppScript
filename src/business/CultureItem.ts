/**
 * Culture item
 * 文化项目
 * @see com.etsoo.Utils.Serialization.Country.CultureItem
 */
export type CultureItem = {
  /**
   * Id, like zh-Hans-CN
   * 编号，如zh-Hans-CN
   */
  id: string;

  /**
   * Two characters id, like zh
   * 两个字符编号
   */
  id2: string;

  /**
   * Three characters id, like zho
   * 三个字符编号
   */
  id3: string;

  /**
   * Parent culture, like zh-Hans
   * 父文化
   */
  parent: string;

  /**
   * Name
   * 名称
   */
  name: string;

  /**
   * Native name, like 中文(简体，中国)
   * 原生名
   */
  nativeName: string;

  /**
   * English name, like Chinese (Simplified, China)
   * 英文名
   */
  englishName: string;
};
