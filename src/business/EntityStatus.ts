/**
 * Standard entity status enum
 * @see com.etsoo.CoreFramework.Business.EntityStatus
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
     * Doing
     */
    Doing = 110,

    /**
     * Audited
     */
    Audited = 120,

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
