import { SendActionMessageRQ } from '../rq/SendActionMessageRQ';

/**
 * Action message response data
 */
export type ResponseActionMessageDto = SendActionMessageRQ & {
    /**
     * User id
     */
    userId: number;

    /**
     * Creation
     */
    creation: string | Date;
};
