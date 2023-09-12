/**
 * Culture item for multilingual labels
 */
export type CultureItem = {
    /**
     * Target id
     */
    id: number;

    /**
     * Culture, like zh-Hans
     */
    culture: string;

    /**
     * Title /  label
     */
    title: string;

    /**
     * JSON data related
     */
    jsonData?: string;
};
