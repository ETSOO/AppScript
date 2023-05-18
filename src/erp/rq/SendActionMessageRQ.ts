/**
 * Send action message request data
 * 发送操作信息请求数据
 */
export type SendActionMessageRQ = {
    /**
     * Kind
     * 类型
     */
    kind: string;

    /**
     * Title
     * 标题
     */
    title: string;

    /**
     * Related id
     * 相关编号
     */
    relatedId?: number;

    /**
     * More data
     * 更多数据
     */
    data?: Record<string, unknown>;
};
