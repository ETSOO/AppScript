import { DataTypes, IStorage, NumberUtils, WindowStorage } from '@etsoo/shared';

/**
 * Shopping cart owner
 * 购物篮所有人
 */
export type ShoppingCartOwner = DataTypes.IdNameItem & {
    isSupplier?: boolean;
};

/**
 * Shopping cart data
 * 购物篮数据
 */
export type ShoppingCartData<T extends ShoppingCartItem> = {
    currency: string;
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

/**
 * Shopping cart
 * 购物篮
 */
export class ShoppingCart<T extends ShoppingCartItem> {
    /**
     * Create identifier key
     * 创建识别键
     * @param currency Currency
     * @returns Result
     */
    static createKey(currency: string) {
        return `ETSOO-CART-${currency}`;
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
     * @param storage Storage
     */
    static clearWith(
        currency: string,
        storage: IStorage = new WindowStorage()
    ) {
        const identifier = this.createKey(currency);
        this.clear(identifier, storage);
    }

    /**
     * Owner data
     * 所有者信息
     */
    owner?: ShoppingCartOwner;

    /**
     * ISO currency id
     * 标准货币编号
     */
    readonly currency: string;

    /**
     * Items
     * 项目
     */
    readonly items: T[];

    /**
     * Order level promotions
     * 订单层面促销
     */
    readonly promotions: ShoppingPromotion[];

    /**
     * Related form data
     * 关联的表单数据
     */
    formData: any;

    /**
     * Currency symbol
     * 币种符号
     */
    readonly symbol: string | undefined;

    /**
     * Cart identifier
     * 购物篮标识
     */
    private readonly identifier: string;

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
    private readonly prices: Record<T['id'], number> = {} as any;

    /**
     * Onchange callback
     * 改变时回调
     */
    onChange?: (reason: ShoppingCartChangeReason, changedItems: T[]) => void;

    /**
     * Constructor
     * 构造函数
     * @param currency Currency ISO code
     * @param storage Data storage
     */
    constructor(currency: string, storage?: IStorage);

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
     * @param state Initialization state
     */
    constructor(
        currencyOrState: string | ShoppingCartData<T>,
        private readonly storage: IStorage = new WindowStorage()
    ) {
        const isCurrency = typeof currencyOrState === 'string';
        this.currency = isCurrency ? currencyOrState : currencyOrState.currency;

        const key = ShoppingCart.createKey(this.currency);
        this.identifier = key;
        this.symbol = NumberUtils.getCurrencySymbol(this.currency);

        let state: ShoppingCartData<T> | undefined;
        if (isCurrency) {
            try {
                state =
                    storage.getPersistedObject<ShoppingCartData<T>>(key) ??
                    storage.getObject<ShoppingCartData<T>>(key);
            } catch (error) {
                console.log('ShoppingCart constructor', error);
            }
        } else {
            state = currencyOrState;
        }

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
     */
    cachePrice(id: T['id'], price: number) {
        this.prices[id] = price;
    }

    /**
     * Clear storage
     * @param keepOwner Keep owner data
     */
    clear(keepOwner?: boolean) {
        this.items.length = 0;
        this.promotions.length = 0;

        if (keepOwner) {
            this.save();
        } else {
            ShoppingCart.clear(this.identifier, this.storage);
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
     * Reset
     * @param item Shopping cart item
     */
    reset(item: ShoppingCartItem) {
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

        const { currency, owner, items, promotions, formData } = this;
        const data: ShoppingCartData<T> = {
            currency,
            owner,
            items,
            promotions,
            formData
        };

        try {
            if (persisted) {
                this.storage.setPersistedData(this.identifier, data);
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
                const removedItems = this.items.splice(index, 1);
                this.doChange('remove', removedItems);
            }
        } else if (index === -1) {
            // New
            if (itemCreator) {
                const price = this.prices[id];
                const newItem = {
                    ...itemCreator(),
                    id,
                    price,
                    qty,
                    subtotal: price * qty,
                    discount: 0
                } as T;
                this.addItem(newItem);
            }
            return false;
        } else {
            // Update
            const item = this.items[index];
            const price = item.price;
            const newItem = {
                ...item,
                qty,
                subtotal: price * qty,
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
        this.cachePrice(id, price);

        const index = this.items.findIndex((item) => item.id === id);
        if (index !== -1) {
            const item = this.items[index];
            const qty = item.qty;
            const newItem = { ...item, price, subtotal: price * qty };
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
