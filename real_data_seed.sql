-- CHINITO SCENTO - REAL DATA IMPORT SQL SCRIPT FROM GOOGLE SHEETS
-- Run this in your Supabase SQL Editor

-- 1. Insert Products
INSERT INTO public.products (code, name, description, selling_price, status, image_url) VALUES
('ANT', 'Antonito (50ml)', 'Artisanal fragrance blend - Antonito', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('AUR', 'Aurelius (50ml)', 'Artisanal fragrance blend - Aurelius', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('DWI', 'Dwight (50ml)', 'Artisanal fragrance blend - Dwight', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('GAB', 'Gab (50ml)', 'Artisanal fragrance blend - Gab', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('BLA', 'Blanche (50ml)', 'Artisanal fragrance blend - Blanche', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('CUC', 'Cucamella (50ml)', 'Artisanal fragrance blend - Cucamella', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('EMI', 'Emily (50ml)', 'Artisanal fragrance blend - Emily', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('KIT', 'Kitty (50ml)', 'Artisanal fragrance blend - Kitty', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('VEL', 'Veloura (50ml)', 'Artisanal fragrance blend - Veloura', 200, 'ACTIVE', '/hero-assets/elysian-amber.png'),
('RDN', 'Reine de Nuit (50ml)', 'Artisanal fragrance blend - Reine de Nuit', 200, 'ACTIVE', '/hero-assets/elysian-amber.png')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  selling_price = EXCLUDED.selling_price,
  status = EXCLUDED.status;

-- 2. Insert Raw Materials
INSERT INTO public.raw_materials (code, description, category, unit, status) VALUES
('ANT-OIL', 'Antonito Oil', 'OIL', 'ml', 'ACTIVE'),
('AUR-OIL', 'Aurelius Oil', 'OIL', 'ml', 'ACTIVE'),
('DWI-OIL', 'Dwight Oil', 'OIL', 'ml', 'ACTIVE'),
('GAB-OIL', 'Gab Oil', 'OIL', 'ml', 'ACTIVE'),
('BLA-OIL', 'Blanche Oil', 'OIL', 'ml', 'ACTIVE'),
('CUC-OIL', 'Cucamella Oil', 'OIL', 'ml', 'ACTIVE'),
('EMI-OIL', 'Emily Oil', 'OIL', 'ml', 'ACTIVE'),
('KIT-OIL', 'Kitty Oil', 'OIL', 'ml', 'ACTIVE'),
('VEL-OIL', 'Veloura Oil', 'OIL', 'ml', 'ACTIVE'),
('RDN-OIL', 'Reine de Nuit Oil', 'OIL', 'ml', 'ACTIVE'),
('EASY', 'EasyBlend', 'SOLVENT', 'ml', 'ACTIVE'),
('BBOT', 'Black Bottle', 'BOTTLE', 'pcs', 'ACTIVE'),
('CBOT', 'Clear Bottle', 'BOTTLE', 'pcs', 'ACTIVE'),
('BOX', 'Box', 'BOX', 'pcs', 'ACTIVE'),
('SHRINK', 'Shrink Wrap', 'BOX', 'pcs', 'ACTIVE'),
('ANT-BTLSTKR', 'Antonito - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('AUR-BTLSTKR', 'Aurelius - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('DWI-BTLSTKR', 'Dwight - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('GAB-BTLSTKR', 'Gab - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('BLA-BTLSTKR', 'Blanche - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('CUC-BTLSTKR', 'Cucamella - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('EMI-BTLSTKR', 'Emily - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('KIT-BTLSTKR', 'Kitty - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('VEL-BTLSTKR', 'Veloura - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('RDN-BTLSTKR', 'Reine De Nuit - Bottle_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('ANT-BOXSTKR', 'Antonito - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('AUR-BOXSTKR', 'Aurelius - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('DWI-BOXSTKR', 'Dwight - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('GAB-BOXSTKR', 'Gab - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('BLA-BOXSTKR', 'Blanche - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('CUC-BOXSTKR', 'Cucamella - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('EMI-BOXSTKR', 'Emily - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('KIT-BOXSTKR', 'Kitty - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('VEL-BOXSTKR', 'Veloura - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE'),
('RDN-BOXSTKR', 'Reine De Nuit - Box_Stickers', 'STICKER', 'pcs', 'ACTIVE')
ON CONFLICT (code) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit;

-- 3. Insert Recipes
INSERT INTO public.recipes (product_code, oil_code, oil_ml, easy_blend_ml, bottle_code, bottle_qty, bottle_sticker_code, bottle_sticker_qty, box_code, box_qty) VALUES
('ANT', 'ANT-OIL', 9, 36, 'BBOT', 1, 'ANT-BTLSTKR', 1, 'BOX', 1),
('AUR', 'AUR-OIL', 9, 36, 'BBOT', 1, 'AUR-BTLSTKR', 1, 'BOX', 1),
('DWI', 'DWI-OIL', 9, 36, 'BBOT', 1, 'DWI-BTLSTKR', 1, 'BOX', 1),
('GAB', 'GAB-OIL', 9, 36, 'BBOT', 1, 'GAB-BTLSTKR', 1, 'BOX', 1),
('BLA', 'BLA-OIL', 9, 36, 'CBOT', 1, 'BLA-BTLSTKR', 1, 'BOX', 1),
('CUC', 'CUC-OIL', 9, 36, 'CBOT', 1, 'CUC-BTLSTKR', 1, 'BOX', 1),
('EMI', 'EMI-OIL', 9, 36, 'CBOT', 1, 'EMI-BTLSTKR', 1, 'BOX', 1),
('KIT', 'KIT-OIL', 9, 36, 'CBOT', 1, 'KIT-BTLSTKR', 1, 'BOX', 1),
('VEL', 'VEL-OIL', 9, 36, 'CBOT', 1, 'VEL-BTLSTKR', 1, 'BOX', 1),
('RDN', 'RDN-OIL', 9, 36, 'BBOT', 1, 'RDN-BTLSTKR', 1, 'BOX', 1);

-- 4. Insert Customers
INSERT INTO public.customers (code, name, type, credit_terms, credit_limit, status) VALUES
('C0001', 'ROMEL L. ESPINA', 'Distributor', 15, 10000, 'INACTIVE'),
('C0002', 'RJAY F. TICONG', 'Distributor', 15, 10000, 'INACTIVE'),
('C0003', 'RICHARD A. RELATIVO JR.', 'Distributor', 15, 10000, 'ACTIVE'),
('C0004', 'EUGENE S. BALURAN JR.', 'Reseller', 7, 2000, 'ACTIVE'),
('C0005', 'JICK A. ESCAMILLA', 'Reseller', 7, 2000, 'ACTIVE'),
('C0006', 'GEMMA R. MAIT', 'Distributor', 15, 10000, 'ACTIVE'),
('C0007', 'ROMEL L. ESPINA', 'Distributor', 15, 10000, 'ACTIVE'),
('C0008', 'RJAY F. TICONG', 'Distributor', 15, 10000, 'ACTIVE'),
('C0009', 'MERELAND MYCO', 'Reseller', 7, 2000, 'ACTIVE')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  credit_terms = EXCLUDED.credit_terms,
  credit_limit = EXCLUDED.credit_limit;
