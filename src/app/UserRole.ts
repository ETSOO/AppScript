/**
 * Standard user roles
 * @see com.etsoo.CoreFramework.Authentication.UserRole
 */
export enum UserRole {
    /**
     * Guest
     */
    Guest = 1,

    /**
     * Outsourcing
     */
    Outsourcing = 2,

    /**
     * Operator
     */
    Operator = 4,

    /**
     * User
     */
    User = 8,

    /**
     * Manager
     */
    Manager = 128,

    /**
     * Finance
     */
    Finance = 256,

    /**
     * HR Manager
     */
    HRManager = 512,

    /**
     * Administrator
     */
    Admin = 8192,

    /**
     * Founder, takes all ownership
     */
    Founder = 16384
}
