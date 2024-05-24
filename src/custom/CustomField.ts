import { CustomFieldData } from './CustomFieldData';

/**
 * Custom field reference
 * 自定义字段引用
 */
export type CustomFieldRef = {
    /**
     * Get value
     */
    getValue(): unknown;

    /**
     * Set value
     * @param value Value
     */
    setValue(value: unknown): void;
};

/**
 * Custom field props
 * 自定义字段属性
 */
export type CustomFieldProps<D extends CustomFieldData> = {
    field: D;
    onChange: (name: string, value: unknown) => void;
    defaultValue?: unknown;
};

/**
 * Custom field interface
 * 自定义字段接口
 */
export interface ICustomField<D extends CustomFieldData, R> {
    (props: CustomFieldProps<D>): R;
}
