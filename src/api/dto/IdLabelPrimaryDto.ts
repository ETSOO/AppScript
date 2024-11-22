import { DataTypes, IdType } from "@etsoo/shared";

/**
 * Dto with id, label and primary field
 */
export type IdLabelPrimaryDto<T extends IdType = number> =
  DataTypes.IdLabelItem<T> & {
    /**
     * Is primary
     */
    readonly isPrimary?: boolean;
  };
