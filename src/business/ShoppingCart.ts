import { DataTypes, IStorage, NumberUtils, WindowStorage } from '@etsoo/shared';
import { Currency } from './Currency';

/**
 * Shopping cart owner
 * 购物篮所有人
 */
export type ShoppingCartOwner = DataTypes.IdNameItem & {
    isSupplier?: boolean;
    culture?: string;
    currency?: Currency;
};

/**
 * Shopping cart data
 * 购物篮数据
 */
export type ShoppingCartData<T extends ShoppingCartItem> = {
    culture: string;
    currency: Currency;
    owner: ShoppingCartOwner;
    items: T[];
    promotions: ShoppingPromotion[];
    formData?: any;
};

/**
 * Shopping promotion
 * 购物促销
 */
export type ShoppingPromotion = {
    /**
     * Promotion id
     * 促销编号
     */
    id: number;

    /**
     * Promotion title
     * 促销标题
     */
    title: string;

    /**
     * Discount amount
     * 折扣金额
     */
    amount: number;
};

/**
 * Shopping cart base item
 * 购物篮基础项目
 */
export type ShoppingCartItemBase = {
    /**
     * Product id
     * 产品编号
     */
    id: DataTypes.IdType;

    /**
     * Product title, default is name
     * 产品标题，默认为name
     */
    title?: string;

    /**
     * Sale price
     * 销售价格
     */
    price: number;

    /**
     * Qty
     * 数量
     */
    qty: number;

    /**
     * Asset qty
     */
    assetQty?: number;

    /**
     * Product level promotions
     * 产品层次促销
     */
    promotions: ShoppingPromotion[];
};

/**
 * Shopping cart item
 * 购物篮项目
 */
export type ShoppingCartItem = ShoppingCartItemBase & {
    /**
     * Product name
     * 产品名称
     */
    name: string;

    /**
     * Current price for cache
     * 当前缓存价格
     */
    currentPrice?: number;

    /**
     * Subtotal
     * 小计
     */
    subtotal: number;

    /**
     * Total discount amount
     * 总折扣金额
     */
    discount: number;
};

/**
 * Shopping cart change reason
 * 购物篮改变原因
 */
export type ShoppingCartChangeReason =
    | 'add'
    | 'clear'
    | 'remove'
    | 'title'
    | 'update';

const ShoppingCartKeyField = 'ETSOO-CART-KEYS';

/**
 * Shopping cart
 * 购物篮
 */
export class ShoppingCart<T extends ShoppingCartItem> {
    /**
     * Create identifier key
     * 创建识别键
     * @param currency Currency
     * @param culture Culture
     * @param key Additional key
     * @returns Result
     */
    static createKey(currency: Currency, culture: string, key: string = 'KEY') {
        return `ETSOO-CART-${culture}-${key}-${currency}`;
    }

    /**
     * Clear shopping cart
     * 清除购物篮
     * @param identifier Identifier
     * @param storage Storage
     */
    static clear(identifier: string, storage: IStorage) {
        try {
            storage.setData(identifier, null);
            storage.setPersistedData(identifier, null);
        } catch (error) {
            console.log('ShoppingCart clear', error);
        }
    }

    /**
     * Clear shopping cart
     * 清除购物篮
     * @param currency Currency
     * @param culture Culture
     * @param storage Storage
     */
    static clearWith(
        currency: Currency,
        culture: string,
        storage: IStorage = new WindowStorage()
    ) {
        const identifier = this.createKey(currency, culture);
        this.clear(identifier, storage);
    }

    /**
     * Get cart data
     * 获取购物篮数据
     * @param storage Storage
     * @param id Cart id
     * @returns Result
     */
    static getCartData<D extends ShoppingCartItem>(
        storage: IStorage,
        id: string
    ) {
        try {
            return (
                storage.getPersistedObject<ShoppingCartData<D>>(id) ??
                storage.getObject<ShoppingCartData<D>>(id)
            );
        } catch (error) {
            console.log('ShoppingCart constructor', error);
        }
    }

    _owner?: ShoppingCartOwner;
    /**
     * Owner data
     * 所有者信息
     */
    get owner() {
        return this._owner;
    }
    set owner(value) {
        if (this._owner?.id === value?.id) return;
        this._owner = value;
        if (value) {
            const data = ShoppingCart.getCartData<T>(
                this.storage,
                this.identifier
            );
            if (data) this.setCartData(data);
        }
    }

    _currency!: Currency;

    /**
     * ISO currency id
     * 标准货币编号
     */
    get currency() {
        return this._currency;
    }
    private set currency(value: Currency) {
        this._currency = value;
    }

    _culture!: string;
    /**
     * ISO culture id, like zh-Hans
     * 标准语言文化编号
     */
    get culture() {
        return this._culture;
    }
    private set culture(value: string) {
        this._culture = value;
    }

    _items: T[] = [];

    /**
     * Items
     * 项目
     */
    get items() {
        return this._items;
    }
    private set items(value) {
        this._items = value;
    }

    _promotions: ShoppingPromotion[] = [];
    /**
     * Order level promotions
     * 订单层面促销
     */
    get promotions() {
        return this._promotions;
    }
    private set promotions(value) {
        this._promotions = value;
    }

    /**
     * Related form data
     * 关联的表单数据
     */
    formData: any;

    _symbol: string | undefined;
    /**
     * Currency symbol
     * 币种符号
     */
    get symbol() {
        return this._symbol;
    }
    private set symbol(value: string | undefined) {
        this._symbol = value;
    }

    /**
     * Cart identifier
     * 购物篮标识
     */
    get identifier() {
        const o = this.owner;
        return ShoppingCart.createKey(
            this.currency,
            this.culture,
            o ? `${o.isSupplier ? 'S' : 'C'}${o.id}` : undefined
        );
    }

    /**
     * All data keys
     * 所有的数据键
     */
    get keys() {
        return this.storage.getPersistedData<string[]>(
            ShoppingCartKeyField,
            []
        );
    }
    set keys(items: string[]) {
        this.storage.setPersistedData(ShoppingCartKeyField, items);
    }

    /**
     * Lines count
     * 项目数量
     */
    get lines() {
        return this.items.length;
    }

    /**
     * Total qty
     * 总数量
     */
    get totalQty() {
        return this.items.map((item) => item.qty).sum();
    }

    /**
     * Total amount
     * 总金额
     */
    get totalAmount() {
        const subtotal = this.items
            .map((item) => item.subtotal - item.discount)
            .sum();

        const discount = this.promotions.sum('amount');

        return subtotal - discount;
    }

    /**
     * Total amount string
     * 总金额字符串
     */
    get totalAmountStr() {
        return this.formatAmount(this.totalAmount);
    }

    /**
     * Cached prices
     * 缓存的价格
     */
    private prices = <Record<T['id'], number>>{};

    /**
     * Onchange callback
     * 改变时回调
     */
    onChange?: (reason: ShoppingCartChangeReason, changedItems: T[]) => void;

    /**
     * Constructor
     * 构造函数
     * @param init Currency & culture ISO code array
     * @param storage Data storage
     */
    constructor(init: [Currency, string], storage?: IStorage);

    /**
     * Constructor
     * 构造函数
     * @param state Initialization state
     * @param storage Data storage
     */
    constructor(state: ShoppingCartData<T>, storage?: IStorage);

    /**
     * Constructor
     * 构造函数
     * @param currency Currency ISO code
     * @param storage Data storage
     */
    constructor(
        currencyOrState: [Currency, string] | ShoppingCartData<T>,
        private readonly storage: IStorage = new WindowStorage()
    ) {
        if (Array.isArray(currencyOrState)) {
            this.changeCurrency(currencyOrState[0]);
            this.changeCulture(currencyOrState[1]);
        } else {
            this.setCartData(currencyOrState);
            this.changeCurrency(currencyOrState.currency);
            this.changeCulture(currencyOrState.culture);
        }
    }

    private setCartData(state: ShoppingCartData<T> | undefined) {
        const { owner, items = [], promotions = [], formData } = state ?? {};
        this.owner = owner;
        this.items = items;
        this.promotions = promotions;
        this.formData = formData;
    }

    private doChange(reason: ShoppingCartChangeReason, changedItems: T[]) {
        if (this.onChange) this.onChange(reason, changedItems);
    }

    /**
     * Add item
     * 添加项目
     * @param item New item
     */
    addItem(item: T) {
        this.addItems([item]);
    }

    /**
     * Add items
     * @param items New items
     */
    addItems(items: T[]) {
        this.items.push(...items);
        this.doChange('add', items);
    }

    /**
     * Cache price
     * @param id Item id
     * @param price Price
     * @param overrideExisting Override existing price
     */
    cachePrice(id: T['id'], price: number, overrideExisting: boolean = false) {
        if (overrideExisting || this.prices[id] == null)
            this.prices[id] = price;
    }

    /**
     * Change currency
     * @param currency Currency
     */
    changeCurrency(currency: Currency) {
        this.currency = currency;
        this.symbol = NumberUtils.getCurrencySymbol(this.currency);
    }

    /**
     * Change culture
     * @param culture Culture
     */
    changeCulture(culture: string) {
        this.culture = culture;
    }

    /**
     * Clear storage
     * @param keepOwner Keep owner data
     */
    clear(keepOwner?: boolean) {
        this.items.length = 0;
        this.promotions.length = 0;
        this.prices = <Record<T['id'], number>>{};

        if (keepOwner) {
            this.save();
        } else {
            ShoppingCart.clear(this.identifier, this.storage);

            const keys = this.keys;
            const index = keys.indexOf(this.identifier);
            if (index !== -1) {
                keys.splice(index, 1);
                this.keys = keys;
            }
        }

        this.doChange('clear', []);
    }

    /**
     * Format amount
     * @param amount Amount
     * @returns Result
     */
    formatAmount(amount: number) {
        return NumberUtils.formatMoney(amount, this.currency);
    }

    /**
     * Get item
     * @param id Item id
     * @returns Result
     */
    getItem(id: T['id']) {
        return this.items.find((item) => item.id === id);
    }

    /**
     * Push item
     * 推送项目
     * @param data Item data
     * @returns Added or not
     */
    pushItem(data: T) {
        if (this.items.some((item) => item.id === data.id)) {
            return false;
        } else {
            this.addItem(data);
            return true;
        }
    }

    /**
     * Reset currency and culture
     * @param currency New currency
     * @param culture New culture
     */
    reset(currency: Currency, culture: string) {
        this.clear(true);
        this.changeCurrency(currency);
        this.changeCulture(culture);
    }

    /**
     * Remove item from the index
     * @param index Item index
     */
    removeItem(index: number) {
        const removedItems = this.items.splice(index, 1);
        this.doChange('remove', removedItems);
    }

    /**
     * Reset item
     * @param item Shopping cart item
     */
    resetItem(item: ShoppingCartItem) {
        item.discount = 0;
        item.currentPrice = undefined;
        item.promotions = [];
    }

    /**
     * Save cart data
     * @param persisted For persisted storage
     */
    save(persisted: boolean = true) {
        if (this.owner == null) return;

        const { currency, culture, owner, items, promotions, formData } = this;
        const data: ShoppingCartData<T> = {
            currency,
            culture,
            owner,
            items,
            promotions,
            formData
        };

        try {
            if (persisted) {
                this.storage.setPersistedData(this.identifier, data);

                const keys = this.keys;
                if (!keys.includes(this.identifier)) {
                    keys.push(this.identifier);
                    this.keys = keys;
                }
            } else {
                this.storage.setData(this.identifier, data);
            }
        } catch (error) {
            console.log('ShoppingCart save', error);
        }

        return data;
    }

    /**
     * Trigger update
     * 触发更新
     */
    update() {
        this.doChange('update', []);
    }

    /**
     * Update discount
     * @param item Shopping cart item
     */
    updateDiscount(item: ShoppingCartItem) {
        item.discount = item.promotions.sum('amount');
    }

    /**
     * Update asset item
     * 更新资产项目
     * @param id Product id
     * @param qty Asset qty
     * @param itemCreator New item creator
     * @returns Updated or not
     */
    updateAssetItem(
        id: T['id'],
        assetQty: number | undefined,
        itemCreator?: () => Omit<
            T,
            'id' | 'price' | 'assetQty' | 'subtotal' | 'discount' | 'promotions'
        >
    ) {
        if (assetQty == null || assetQty <= 0) assetQty = 1;

        const index = this.items.findIndex((item) => item.id === id);
        if (index === -1) {
            // New
            if (itemCreator) {
                const price = this.prices[id];
                const data = itemCreator();
                const qty = data.qty;
                const newItem = {
                    ...data,
                    id,
                    price,
                    assetQty,
                    subtotal: price * qty * assetQty,
                    discount: 0,
                    promotions: Array<ShoppingPromotion>()
                } as T;
                this.addItem(newItem);
            }
            return false;
        } else {
            // Update
            const item = this.items[index];

            // Price may be cached first
            const price = this.prices[id] ?? item.price;
            const qty = item.qty;

            const newItem = {
                ...item,
                price,
                assetQty,
                subtotal: price * qty * assetQty,
                discount: 0
            };
            this.items.splice(index, 1, newItem);
            this.doChange('update', [item, newItem]);
        }

        return true;
    }

    /**
     * Update item
     * 更新项目
     * @param id Product id
     * @param qty Qty
     * @param itemCreator New item creator
     * @returns Updated or not
     */
    updateItem(
        id: T['id'],
        qty: number | undefined,
        itemCreator?: () => Omit<
            T,
            'id' | 'price' | 'qty' | 'subtotal' | 'discount' | 'promotions'
        >
    ) {
        const index = this.items.findIndex((item) => item.id === id);
        if (qty == null) {
            // Remove the item
            if (index !== -1) {
                this.removeItem(index);
            }
        } else if (index === -1) {
            // New
            if (itemCreator) {
                const price = this.prices[id];
                const data = itemCreator();
                const newItem = {
                    ...data,
                    id,
                    price,
                    qty,
                    subtotal: price * qty * (data.assetQty || 1),
                    discount: 0,
                    promotions: Array<ShoppingPromotion>()
                } as T;
                this.addItem(newItem);
            }
            return false;
        } else {
            // Update
            const item = this.items[index];

            // Price may be cached first
            const price = this.prices[id] ?? item.price;
            const newItem = {
                ...item,
                qty,
                price,
                subtotal: price * qty * (item.assetQty || 1),
                discount: 0
            };
            this.items.splice(index, 1, newItem);
            this.doChange('update', [item, newItem]);
        }

        return true;
    }

    /**
     * Update price
     * @param id Item id
     * @param price New price
     */
    updatePrice(id: T['id'], price: number) {
        this.cachePrice(id, price, true);

        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
            const item = this.items[index];
            const qty = item.qty;
            const assetQty = item.assetQty || 1;
            const newItem = {
                ...item,
                price,
                subtotal: price * qty * assetQty
            };
            this.items.splice(index, 1, newItem);
            this.doChange('update', [item, newItem]);
        }
    }

    /**
     * Update title
     * @param id Item id
     * @param title New title
     */
    updateTitle(id: T['id'], title: string) {
        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
            const item = this.items[index];
            const newItem: T = { ...item, title };
            if (newItem.name === newItem.title) newItem.title = undefined;
            this.items.splice(index, 1, newItem);
            this.doChange('title', [item, newItem]);
        }
    }
}
