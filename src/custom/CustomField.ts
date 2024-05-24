import { CustomFieldData } from './CustomFieldData';

/**
 * Custom field reference
 * 自定义字段引用
 */
export type CustomFieldRef<V> = {
    /**
     * Get value
     */
    getValue(): V;

    /**
     * Set value
     * @param value Value
     */
    setValue(value: V): void;
};

/**
 * Custom field props
 * 自定义字段属性
 */
export type CustomFieldProps<D extends CustomFieldData, V> = {
    field: D;
    onChange: (name: string, value: V) => void;
    defaultValue?: V;
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
