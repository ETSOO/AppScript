import { CustomFieldData } from './CustomFieldData';

/**
 * Custom field reference
 * 自定义字段引用
 */
export type CustomFieldRef<V> = {
    /**
     * Get value
     */
    getValue(): V | undefined;

    /**
     * Set value
     * Its type is 'unknown' because the 'type' configuration of the CustomField may be changed
     * First time editing with the new 'type' may break the component
     * @param value Value, similar with the 'defaultValue' of the component
     */
    setValue(value: unknown): void;
};

/**
 * Custom field props
 * 自定义字段属性
 */
export type CustomFieldProps<D extends CustomFieldData, V> = {
    field: D;
    onChange: (name: string, value: V | undefined) => void;
    defaultValue?: unknown;
};

/**
 * Custom field interface
 * 自定义字段接口
 */
export interface ICustomField<
    V,
    D extends CustomFieldData,
    P extends CustomFieldProps<D, V>,
    R
> {
    (props: P): R;
}
