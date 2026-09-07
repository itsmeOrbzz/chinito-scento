import { createClient } from '@supabase/supabase-js';
import {
  Product,
  RawMaterial,
  Recipe,
  Customer,
  InventoryMovement,
  ProductionBatch,
  SalesOrder,
  Purchase,
  Collection,
} from '@/types/erp';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Seed Data for Clean Production State
const INITIAL_PRODUCTS: Product[] = [];
const INITIAL_RAW_MATERIALS: RawMaterial[] = [];
const INITIAL_RECIPES: Recipe[] = [];
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_INVENTORY_MOVEMENTS: InventoryMovement[] = [];
const INITIAL_BATCHES: ProductionBatch[] = [];
const INITIAL_SALES_ORDERS: SalesOrder[] = [];

// Helper LocalStorage Store Manager for Local Preview Mode
export const getLocalStore = <T>(key: string, initial: T[]): T[] => {
  if (typeof window === 'undefined') return initial;
  const data = localStorage.getItem(`chinito_${key}`);
  if (!data) {
    localStorage.setItem(`chinito_${key}`, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initial;
  }
};

export const setLocalStore = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`chinito_${key}`, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('chinito_store_updated', { detail: { key } }));
};

// Automatic Supabase Cloud Data Pulling
export const syncFromSupabase = async (): Promise<boolean> => {
  if (!supabase || typeof window === 'undefined') return false;
  try {
    let updated = false;

    const { data: productsData } = await supabase.from('products').select('*');
    if (productsData && productsData.length > 0) {
      setLocalStore('products', productsData);
      updated = true;
    }

    const { data: rawMaterialsData } = await supabase.from('raw_materials').select('*');
    if (rawMaterialsData && rawMaterialsData.length > 0) {
      setLocalStore('materials', rawMaterialsData);
      updated = true;
    }

    const { data: recipesData } = await supabase.from('recipes').select('*');
    if (recipesData && recipesData.length > 0) {
      setLocalStore('recipes', recipesData);
      updated = true;
    }

    const { data: customersData } = await supabase.from('customers').select('*');
    if (customersData && customersData.length > 0) {
      setLocalStore('customers', customersData);
      updated = true;
    }

    const { data: salesOrdersData } = await supabase.from('sales_orders').select('*');
    if (salesOrdersData && salesOrdersData.length > 0) {
      setLocalStore('sales_orders', salesOrdersData);
      updated = true;
    }

    return updated;
  } catch (err) {
    console.warn('Error pulling data from Supabase:', err);
    return false;
  }
};

export const localStoreAPI = {
  getProducts: () => getLocalStore<Product>('products', INITIAL_PRODUCTS),
  saveProduct: (product: Product) => {
    const list = getLocalStore<Product>('products', INITIAL_PRODUCTS);
    const existing = list.findIndex(p => p.code === product.code);
    let itemToSave = product;
    if (existing >= 0) {
      list[existing] = product;
    } else {
      itemToSave = { ...product, id: `p_${Date.now()}` };
      list.push(itemToSave);
    }
    setLocalStore('products', list);

    if (supabase) {
      supabase.from('products').upsert({
        code: itemToSave.code,
        name: itemToSave.name,
        description: itemToSave.description,
        selling_price: itemToSave.selling_price,
        status: itemToSave.status,
        image_url: itemToSave.image_url,
      }).then(({ error }) => {
        if (error) console.warn('Supabase product sync warning:', error.message);
      });
    }

    return itemToSave;
  },

  getRawMaterials: () => getLocalStore<RawMaterial>('materials', INITIAL_RAW_MATERIALS),
  saveRawMaterial: (material: RawMaterial) => {
    const list = getLocalStore<RawMaterial>('materials', INITIAL_RAW_MATERIALS);
    const existing = list.findIndex(m => m.code === material.code);
    let itemToSave = material;
    if (existing >= 0) {
      list[existing] = material;
    } else {
      itemToSave = { ...material, id: `m_${Date.now()}` };
      list.push(itemToSave);
    }
    setLocalStore('materials', list);

    if (supabase) {
      supabase.from('raw_materials').upsert({
        code: itemToSave.code,
        description: itemToSave.description,
        category: itemToSave.category,
        unit: itemToSave.unit,
        status: itemToSave.status,
      }).then(({ error }) => {
        if (error) console.warn('Supabase raw material sync warning:', error.message);
      });
    }

    return itemToSave;
  },

  getRecipes: () => getLocalStore<Recipe>('recipes', INITIAL_RECIPES),
  saveRecipe: (recipe: Recipe) => {
    const list = getLocalStore<Recipe>('recipes', INITIAL_RECIPES);
    const existing = list.findIndex(r => r.product_code === recipe.product_code);
    let itemToSave = recipe;
    if (existing >= 0) {
      list[existing] = recipe;
    } else {
      itemToSave = { ...recipe, id: `r_${Date.now()}` };
      list.push(itemToSave);
    }
    setLocalStore('recipes', list);

    if (supabase) {
      supabase.from('recipes').upsert({
        product_code: itemToSave.product_code,
        oil_code: itemToSave.oil_code,
        oil_ml: itemToSave.oil_ml,
        easy_blend_ml: itemToSave.easy_blend_ml,
        bottle_code: itemToSave.bottle_code,
        bottle_qty: itemToSave.bottle_qty,
        bottle_sticker_code: itemToSave.bottle_sticker_code,
        bottle_sticker_qty: itemToSave.bottle_sticker_qty,
        box_code: itemToSave.box_code,
        box_qty: itemToSave.box_qty,
      }).then(({ error }) => {
        if (error) console.warn('Supabase recipe sync warning:', error.message);
      });
    }

    return itemToSave;
  },

  getCustomers: () => getLocalStore<Customer>('customers', INITIAL_CUSTOMERS),
  saveCustomer: (customer: Customer) => {
    const list = getLocalStore<Customer>('customers', INITIAL_CUSTOMERS);
    const existing = list.findIndex(c => c.code === customer.code);
    let itemToSave = customer;
    if (existing >= 0) {
      list[existing] = customer;
    } else {
      itemToSave = { ...customer, id: `c_${Date.now()}` };
      list.push(itemToSave);
    }
    setLocalStore('customers', list);

    if (supabase) {
      supabase.from('customers').upsert({
        code: itemToSave.code,
        name: itemToSave.name,
        type: itemToSave.type,
        credit_terms: itemToSave.credit_terms,
        credit_limit: itemToSave.credit_limit,
        status: itemToSave.status,
      }).then(({ error }) => {
        if (error) console.warn('Supabase customer sync warning:', error.message);
      });
    }

    return itemToSave;
  },

  getInventoryMovements: () => getLocalStore<InventoryMovement>('inventory', INITIAL_INVENTORY_MOVEMENTS),
  addInventoryMovement: (movement: InventoryMovement) => {
    const list = getLocalStore<InventoryMovement>('inventory', INITIAL_INVENTORY_MOVEMENTS);
    list.push({ ...movement, id: `inv_${Date.now()}` });
    setLocalStore('inventory', list);
  },

  getProductionBatches: () => getLocalStore<ProductionBatch>('batches', INITIAL_BATCHES),
  saveProductionBatch: (batch: ProductionBatch) => {
    const list = getLocalStore<ProductionBatch>('batches', INITIAL_BATCHES);
    const existing = list.findIndex(b => b.batch_no === batch.batch_no);
    if (existing >= 0) {
      list[existing] = batch;
    } else {
      list.push({ ...batch, id: `b_${Date.now()}` });
    }
    setLocalStore('batches', list);
    return batch;
  },

  getSalesOrders: () => getLocalStore<SalesOrder>('sales_orders', INITIAL_SALES_ORDERS),
  saveSalesOrder: (so: SalesOrder) => {
    const list = getLocalStore<SalesOrder>('sales_orders', INITIAL_SALES_ORDERS);
    const existing = list.findIndex(s => s.so_no === so.so_no);
    let itemToSave = so;
    if (existing >= 0) {
      list[existing] = so;
    } else {
      itemToSave = { ...so, id: `so_${Date.now()}` };
      list.unshift(itemToSave);
    }
    setLocalStore('sales_orders', list);

    if (supabase) {
      supabase.from('sales_orders').upsert({
        so_no: itemToSave.so_no,
        date: itemToSave.date,
        customer_code: itemToSave.customer_code,
        customer_name: itemToSave.customer_name,
        customer_type: itemToSave.customer_type,
        customer_contact: itemToSave.customer_contact,
        delivery_address: itemToSave.delivery_address,
        total_amount: itemToSave.total_amount,
        payment_form: itemToSave.payment_form,
        terms: itemToSave.terms,
        amount_collected: itemToSave.amount_collected,
        balance: itemToSave.balance,
        status: itemToSave.status,
        created_by: itemToSave.created_by,
        lines: itemToSave.lines,
      }).then(({ error }) => {
        if (error) console.warn('Supabase sales order sync warning:', error.message);
      });
    }

    return itemToSave;
  },

  getPurchases: () => getLocalStore<Purchase>('purchases', []),
  savePurchase: (purchase: Purchase) => {
    const list = getLocalStore<Purchase>('purchases', []);
    list.unshift({ ...purchase, id: `po_${Date.now()}` });
    setLocalStore('purchases', list);
    return purchase;
  },

  getCollections: () => getLocalStore<Collection>('collections', []),
  saveCollection: (col: Collection) => {
    const list = getLocalStore<Collection>('collections', []);
    list.unshift({ ...col, id: `col_${Date.now()}` });
    setLocalStore('collections', list);
    return col;
  },

  deleteProduct: (code: string) => {
    const list = getLocalStore<Product>('products', INITIAL_PRODUCTS).filter(p => p.code !== code);
    setLocalStore('products', list);
    if (supabase) {
      supabase.from('products').delete().eq('code', code).then(({ error }) => {
        if (error) console.warn('Supabase delete product warning:', error.message);
      });
    }
  },

  deleteRawMaterial: (code: string) => {
    const list = getLocalStore<RawMaterial>('materials', INITIAL_RAW_MATERIALS).filter(m => m.code !== code);
    setLocalStore('materials', list);
    if (supabase) {
      supabase.from('raw_materials').delete().eq('code', code).then(({ error }) => {
        if (error) console.warn('Supabase delete raw material warning:', error.message);
      });
    }
  },

  deleteRecipe: (productCode: string) => {
    const list = getLocalStore<Recipe>('recipes', INITIAL_RECIPES).filter(r => r.product_code !== productCode);
    setLocalStore('recipes', list);
    if (supabase) {
      supabase.from('recipes').delete().eq('product_code', productCode).then(({ error }) => {
        if (error) console.warn('Supabase delete recipe warning:', error.message);
      });
    }
  },

  deleteCustomer: (code: string) => {
    const list = getLocalStore<Customer>('customers', INITIAL_CUSTOMERS).filter(c => c.code !== code);
    setLocalStore('customers', list);
    if (supabase) {
      supabase.from('customers').delete().eq('code', code).then(({ error }) => {
        if (error) console.warn('Supabase delete customer warning:', error.message);
      });
    }
  }
};
