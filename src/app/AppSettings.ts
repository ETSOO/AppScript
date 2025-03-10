import { DataTypes } from "@etsoo/shared";
import { AddressRegion } from "../address/AddressRegion";
import { IExternalSettings } from "./ExternalSettings";

/**
 * App settings interface
 */
export interface IAppSettings extends IExternalSettings {
  /**
   * Application id
   * 程序编号
   */
  readonly appId: number;

  /**
   * Supported country/region ids
   */
  readonly regions: string[];

  /**
   * Supported cultures
   */
  readonly cultures: DataTypes.CultureDefinition[];

  /**
   * Detected culture
   */
  readonly detectedCulture: string;

  /**
   * Time zone, set a static value for all clients
   */
  timeZone?: string;

  /**
   * Current country or region
   */
  currentRegion: AddressRegion;

  /**
   * Current culture
   */
  currentCulture: DataTypes.CultureDefinition;
}
