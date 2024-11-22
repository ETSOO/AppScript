/**
 * Business tax interface
 */
export interface IBusinessTax {
  /**
   * Id
   */
  readonly id: string;

  /**
   * Name
   */
  readonly name: string;

  /**
   * Mask
   */
  readonly mask: string;

  /**
   * Get label key
   */
  readonly labelKey: string;
}

/**
 * Business tax
 * https://imask.js.org/
 */
export class BusinessTax implements IBusinessTax {
  /**
   * CN
   * Unified Social Credit Code (USCC) / 统一信用代码
   * https://zh.wikisource.org/wiki/GB_32100-2015_%E6%B3%95%E4%BA%BA%E5%92%8C%E5%85%B6%E4%BB%96%E7%BB%84%E7%BB%87%E7%BB%9F%E4%B8%80%E7%A4%BE%E4%BC%9A%E4%BF%A1%E7%94%A8%E4%BB%A3%E7%A0%81%E7%BC%96%E7%A0%81%E8%A7%84%E5%88%99
   */
  static CN = new BusinessTax("CN", "USCC", "*0-000000-**********");

  /**
   * NZ, Inland Revenue (IRD)
   */
  static NZ = new BusinessTax("NZ", "IRD", "00[0]-000-000");

  /**
   * US, Employer Identification Number (EIN)
   */
  static US = new BusinessTax("US", "EIN", "00-0000000");

  /**
   * CA, tax ID number (Business Number, BN)
   */
  static CA = new BusinessTax("CA", "BN", "000000000");

  /**
   * HK, Business Registration Number (BRN)
   */
  static HK = new BusinessTax("HK", "BRN", "00000000");

  /**
   * All countries and regions
   */
  static all = [
    BusinessTax.CN,
    BusinessTax.NZ,
    BusinessTax.US,
    BusinessTax.CA,
    BusinessTax.HK
  ];

  /**
   * Get country or region by id
   * @param id Country id
   */
  static getById(id: string) {
    return BusinessTax.all.find((c) => c.id === id);
  }

  // Typescript constructor shorthand
  constructor(public id: string, public name: string, public mask: string) {}

  /**
   * Get label key
   */
  get labelKey() {
    return "tax" + this.id + this.name;
  }
}
