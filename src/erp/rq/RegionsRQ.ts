export type RegionsRQ = {
    /**
     * Favored country ids from top to bottom
     */
    favoredIds?: string[];

    /**
     * Items count to query
     */
    items?: number;

    /**
     * Filter keyword
     */
    keyword?: string;
};
