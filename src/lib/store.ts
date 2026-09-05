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

// Initial Seed Data for Instant Local Preview
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: 'SCENT-01',
    name: 'Elysian Amber (100ml)',
    description: 'A warm, rich blend of golden amber, Madagascar vanilla, and cedarwood.',
    selling_price: 1250.00,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    code: 'SCENT-02',
    name: 'Midnight Bloom (100ml)',
    description: 'Mysterious night-blooming jasmine, dark bergamot, and white musk.',
    selling_price: 1350.00,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    code: 'SCENT-03',
    name: 'Oceanic Vetiver (100ml)',
    description: 'Crisp sea spray, Haitian vetiver, and sparkling citrus peel.',
    selling_price: 1150.00,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
  },
];

const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  { id: 'm1', code: 'OIL-AMBER', description: 'Golden Amber Fragrance Oil', category: 'OIL', unit: 'ml', status: 'ACTIVE' },
  { id: 'm2', code: 'OIL-JASMINE', description: 'Night Jasmine Fragrance Oil', category: 'OIL', unit: 'ml', status: 'ACTIVE' },
  { id: 'm3', code: 'OIL-VETIVER', description: 'Haitian Vetiver Oil', category: 'OIL', unit: 'ml', status: 'ACTIVE' },
  { id: 'm4', code: 'EASY', description: 'EasyBlend Perfumers Alcohol Base', category: 'SOLVENT', unit: 'ml', status: 'ACTIVE' },
  { id: 'm5', code: 'BOTTLE-100ML', description: '100ml Heavy Glass Bottle', category: 'BOTTLE', unit: 'pcs', status: 'ACTIVE' },
  { id: 'm6', code: 'STICKER-BOTTLE', description: 'Custom Embossed Bottle Label', category: 'STICKER', unit: 'pcs', status: 'ACTIVE' },
  { id: 'm7', code: 'BOX-GOLD', description: 'Lux Gold Foil Packaging Box', category: 'BOX', unit: 'pcs', status: 'ACTIVE' },
];

const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'r1',
    product_code: 'SCENT-01',
    oil_code: 'OIL-AMBER',
    oil_ml: 25,
    easy_blend_ml: 75,
    bottle_code: 'BOTTLE-100ML',
    bottle_qty: 1,
    bottle_sticker_code: 'STICKER-BOTTLE',
    bottle_sticker_qty: 1,
    box_code: 'BOX-GOLD',
    box_qty: 1,
  },
  {
    id: 'r2',
    product_code: 'SCENT-02',
    oil_code: 'OIL-JASMINE',
    oil_ml: 30,
    easy_blend_ml: 70,
    bottle_code: 'BOTTLE-100ML',
    bottle_qty: 1,
    bottle_sticker_code: 'STICKER-BOTTLE',
    bottle_sticker_qty: 1,
    box_code: 'BOX-GOLD',
    box_qty: 1,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', code: 'C0001', name: 'Perfume Haven Boutique', type: 'Distributor', credit_terms: 30, credit_limit: 50000, status: 'ACTIVE' },
  { id: 'c2', code: 'C0002', name: 'Scent & Style Kiosk', type: 'Reseller', credit_terms: 15, credit_limit: 20000, status: 'ACTIVE' },
  { id: 'c3', code: 'C0003', name: 'Walk-In Customer (Retail)', type: 'Walk-In', credit_terms: 0, credit_limit: 0, status: 'ACTIVE' },
];

const INITIAL_INVENTORY_MOVEMENTS: InventoryMovement[] = [
  { id: 'inv1', date: '2026-09-01', type: 'PURCHASE', category: 'RAW', item_code: 'OIL-AMBER', qty_in: 5000, qty_out: 0, reference_no: 'PO-2026-0001', remarks: 'Initial Stock' },
  { id: 'inv2', date: '2026-09-01', type: 'PURCHASE', category: 'RAW', item_code: 'EASY', qty_in: 20000, qty_out: 0, reference_no: 'PO-2026-0001', remarks: 'Initial Stock' },
  { id: 'inv3', date: '2026-09-01', type: 'PURCHASE', category: 'RAW', item_code: 'BOTTLE-100ML', qty_in: 500, qty_out: 0, reference_no: 'PO-2026-0001', remarks: 'Initial Stock' },
  { id: 'inv4', date: '2026-09-01', type: 'PURCHASE', category: 'RAW', item_code: 'STICKER-BOTTLE', qty_in: 1000, qty_out: 0, reference_no: 'PO-2026-0001', remarks: 'Initial Stock' },
  { id: 'inv5', date: '2026-09-01', type: 'PURCHASE', category: 'RAW', item_code: 'BOX-GOLD', qty_in: 500, qty_out: 0, reference_no: 'PO-2026-0001', remarks: 'Initial Stock' },
  { id: 'inv6', date: '2026-09-02', type: 'PRODUCTION-COMPLETE', category: 'FG', item_code: 'SCENT-01', qty_in: 50, qty_out: 0, reference_no: 'BATCH-001', remarks: 'Initial Batch Produced' },
  { id: 'inv7', date: '2026-09-02', type: 'PRODUCTION-COMPLETE', category: 'FG', item_code: 'SCENT-02', qty_in: 30, qty_out: 0, reference_no: 'BATCH-002', remarks: 'Initial Batch Produced' },
];

const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'b1',
    batch_no: 'SCENT-01-20260901-001',
    product_code: 'SCENT-01',
    date_mixed: '2026-08-25',
    maceration_days: 7,
    ready_date: '2026-09-01',
    expected_bottles: 50,
    actual_bottles: 50,
    variance: 0,
    status: 'Released',
    completed_by: 'Master Perfumer',
    completed_at: '2026-09-01',
  },
  {
    id: 'b2',
    batch_no: 'SCENT-02-20260904-001',
    product_code: 'SCENT-02',
    date_mixed: '2026-09-04',
    maceration_days: 7,
    ready_date: '2026-09-11',
    expected_bottles: 40,
    status: 'Macerating',
  },
];

const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so1',
    so_no: 'SO-000001',
    date: '2026-09-04T10:00:00Z',
    customer_code: 'C0001',
    customer_name: 'Perfume Haven Boutique',
    customer_type: 'Distributor',
    customer_contact: '0917-555-0199',
    delivery_address: '123 Luxury Lane, Makati City',
    total_amount: 12500.00,
    payment_form: 'CREDIT',
    terms: 30,
    amount_collected: 0,
    balance: 12500.00,
    status: 'PENDING APPROVAL',
    created_by: 'Public Online Order',
    lines: [
      { product_code: 'SCENT-01', product_name: 'Elysian Amber (100ml)', quantity: 10, unit_price: 1250.00, line_amount: 12500.00 }
    ]
  }
];

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
  }
};
