-- CHINITO SCENTO ERP & STOREFRONT - SUPABASE POSTGRESQL SCHEMA

-- 1. Products Table (Perfume Scents Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Raw Materials Table (Oils, Solvents, Bottles, Stickers, Boxes)
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('OIL', 'SOLVENT', 'BOTTLE', 'STICKER', 'BOX')),
    unit TEXT NOT NULL CHECK (unit IN ('ml', 'pcs')),
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Recipes / BOM Formulas Table
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code TEXT NOT NULL REFERENCES public.products(code) ON DELETE CASCADE,
    oil_code TEXT NOT NULL REFERENCES public.raw_materials(code),
    oil_ml NUMERIC(10, 2) NOT NULL DEFAULT 0,
    easy_blend_ml NUMERIC(10, 2) NOT NULL DEFAULT 0,
    bottle_code TEXT NOT NULL REFERENCES public.raw_materials(code),
    bottle_qty NUMERIC(10, 2) NOT NULL DEFAULT 1,
    bottle_sticker_code TEXT REFERENCES public.raw_materials(code),
    bottle_sticker_qty NUMERIC(10, 2) DEFAULT 1,
    box_code TEXT REFERENCES public.raw_materials(code),
    box_qty NUMERIC(10, 2) DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Customers Table (Distributors, Resellers, Retail)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Distributor', 'Reseller', 'Walk-In')),
    credit_terms INT DEFAULT 0,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sales Orders Table (Customer Orders & Tracking)
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    so_no TEXT UNIQUE NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customer_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_type TEXT DEFAULT 'Walk-In',
    customer_contact TEXT,
    delivery_address TEXT,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_form TEXT NOT NULL CHECK (payment_form IN ('GCASH', 'BANK_TRANSFER', 'CASH', 'CREDIT')),
    terms INT DEFAULT 0,
    amount_collected NUMERIC(12, 2) DEFAULT 0.00,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT NOT NULL CHECK (status IN ('PENDING APPROVAL', 'APPROVED', 'PARTIAL', 'PAID', 'REJECTED')),
    created_by TEXT DEFAULT 'Public Storefront',
    lines JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Read/Write Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public read access to raw_materials" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to raw_materials" ON public.raw_materials FOR ALL USING (true);

CREATE POLICY "Allow public read access to recipes" ON public.recipes FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to recipes" ON public.recipes FOR ALL USING (true);

CREATE POLICY "Allow public read access to customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to customers" ON public.customers FOR ALL USING (true);

CREATE POLICY "Allow public read access to sales_orders" ON public.sales_orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update access to sales_orders" ON public.sales_orders FOR ALL USING (true);
