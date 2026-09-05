export type CustomerType = 'Distributor' | 'Reseller' | 'Walk-In';
export type CustomerStatus = 'ACTIVE' | 'INACTIVE';
export type ItemStatus = 'ACTIVE' | 'INACTIVE';
export type PaymentType = 'CASH' | 'GCASH' | 'BANK_TRANSFER' | 'CREDIT';
export type PaymentMode = 'ONETIME' | 'INSTALLMENT';
export type SalesOrderStatus = 'PENDING APPROVAL' | 'APPROVED' | 'REJECTED' | 'OPEN' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type BatchStatus = 'Macerating' | 'Ready' | 'Released';

export interface Product {
  id?: string;
  code: string;
  name: string;
  description?: string;
  selling_price: number;
  status: ItemStatus;
  image_url?: string;
}

export interface RawMaterial {
  id?: string;
  code: string;
  description: string;
  category: 'OIL' | 'SOLVENT' | 'BOTTLE' | 'STICKER' | 'BOX' | 'PACKAGING';
  unit: 'ml' | 'pcs';
  status: ItemStatus;
}

export interface Recipe {
  id?: string;
  product_code: string;
  oil_code: string;
  oil_ml: number;
  easy_blend_ml: number;
  bottle_code: string;
  bottle_qty: number;
  bottle_sticker_code: string;
  bottle_sticker_qty: number;
  box_code: string;
  box_qty: number;
  box_sticker_code?: string;
  box_sticker_qty?: number;
  shrink_code?: string;
  shrink_qty?: number;
}

export interface Customer {
  id?: string;
  code: string;
  name: string;
  type: CustomerType;
  credit_terms: number; // days e.g. 15
  credit_limit: number;
  status: CustomerStatus;
}

export interface InventoryMovement {
  id?: string;
  created_at?: string;
  date: string;
  type: 'PURCHASE' | 'PRODUCTION-USE' | 'PRODUCTION-COMPLETE' | 'SO' | 'SALES-RETURN' | 'ADJUSTMENT';
  category: 'RAW' | 'FG';
  item_code: string;
  qty_in: number;
  qty_out: number;
  reference_no: string;
  remarks: string;
}

export interface ProductionBatch {
  id?: string;
  batch_no: string;
  product_code: string;
  date_mixed: string;
  maceration_days: number;
  ready_date: string;
  expected_bottles: number;
  actual_bottles?: number;
  variance?: number;
  status: BatchStatus;
  remarks?: string;
  completed_by?: string;
  completed_at?: string;
}

export interface PurchaseItem {
  material_code: string;
  quantity_purchased: number;
  volume: number; // e.g. 1000ml bottle
  unit: string;
  unit_cost: number;
  total_cost: number;
}

export interface Purchase {
  id?: string;
  purchase_no: string;
  purchase_date: string;
  supplier: string;
  invoice_no: string;
  items: PurchaseItem[];
  payment_type: PaymentType;
  payment_mode?: PaymentMode;
  creditor?: string;
  credit_start_date?: string;
  installment_months?: number;
  monthly_amortization?: number;
  total_amount_due?: number;
  ap_balance?: number;
  ap_status?: 'PAID' | 'OPEN';
  remarks?: string;
}

export interface SalesOrderLine {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_amount: number;
}

export interface SalesOrder {
  id?: string;
  so_no: string;
  date: string;
  customer_code: string;
  customer_name: string;
  customer_type: CustomerType;
  total_amount: number;
  payment_form: PaymentType;
  terms: number;
  due_date?: string;
  amount_collected: number;
  balance: number;
  status: SalesOrderStatus;
  created_by?: string;
  lines: SalesOrderLine[];
  customer_contact?: string;
  delivery_address?: string;
}

export interface Collection {
  id?: string;
  collection_no: string;
  date: string;
  customer_code: string;
  customer_name: string;
  so_no: string;
  amount_collected: number;
  payment_method: PaymentType;
  reference_no: string;
  remarks?: string;
}
