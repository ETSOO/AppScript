/**
 * Standard entity status enum
 * com.etsoo.SmartERP.Dto.EntityStatus
 * Labels also included within i18n
 */
export enum EntityStatus {
    /**
     * Normal
     */
    Normal = 0,

    /**
     * Flaged
     */
    Flaged = 9,

    /**
     * Approved
     */
    Approved = 100,

    /**
     * Audited
     */
    Audited = 111,

    /**
     * Inactivated
     */
    Inactivated = 200,

    /**
     * Completed
     */
    Completed = 250,

    /**
     * Archived
     */
    Archived = 254,

    /**
     * Deleted
     */
    Deleted = 255
}
