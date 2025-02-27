/**
 * Admin support request data
 * 管理员支持请求数据
 */
export type AdminSupportRQ = {
  /**
   * Target organization ID
   * 目标机构编号
   */
  orgId: number;

  /**
   * Requester
   * 请求人
   */
  requester: number;

  /**
   * Approver
   * 批准人
   */
  approver: number;

  /**
   * Comment
   * 备注
   */
  comment: string;
};
