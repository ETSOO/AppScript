/**
 * Antiforgery token
 * 反伪造令牌
 */
export type AntiforgeryRequestToken = {
    /**
     * Name of the form field used for the request token
     * 用于请求令牌的表单字段名称
     */
    name: string;

    /**
     * Name of the header used for the request token
     * 用于请求令牌的标头名称
     */
    headerName?: string;

    /**
     * Request token value
     * 请求令牌值
     */
    value?: string;
};
