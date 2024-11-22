import { DataTypes, DomUtils } from "@etsoo/shared";

/**
 * Culture namespace
 */
export namespace Culture {
  /**
   * Make culture
   * @param cultureMaker Culture maker
   * @param resources Resources
   * @returns Culture
   */
  export function make(
    cultureMaker: typeof DomUtils.zhHans,
    ...resources: (object | (() => Promise<object>))[]
  ) {
    return cultureMaker(async () => {
      const rs = await Promise.all(
        resources.map(
          (resource) =>
            new Promise<object>((resolve) => {
              if (typeof resource === "object") {
                resolve(resource);
              } else {
                resource().then((result) => resolve(result));
              }
            })
        )
      );
      return rs.reduce((prev, curr) => ({
        ...prev,
        ...curr
      })) as DataTypes.StringRecord;
    });
  }

  /**
   * Get en neutral culture
   * @param localResources Local resources
   * @returns Full culture
   */
  export const en = (...resources: (object | (() => Promise<object>))[]) =>
    make(DomUtils.en, import("./en.json"), ...resources);

  /**
   * Get zh-Hans neutral cultrue
   * @param localResources Local resources
   * @returns Full culture
   */
  export const zhHans = (...resources: (object | (() => Promise<object>))[]) =>
    make(DomUtils.zhHans, import("./zh-Hans.json"), ...resources);

  /**
   * Get zh-Hant neutral cultrue
   * @param localResources Local resources
   * @returns Full culture
   */
  export const zhHant = (...resources: (object | (() => Promise<object>))[]) =>
    make(DomUtils.zhHant, import("./zh-Hant.json"), ...resources);
}
