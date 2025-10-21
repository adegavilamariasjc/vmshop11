-- Add description column to products table
ALTER TABLE products ADD COLUMN description TEXT DEFAULT 'Produto de qualidade' NOT NULL;

-- Add generic descriptions to existing products based on common patterns
UPDATE products SET description = 'Bebida refrescante e gelada' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%bebida%');
UPDATE products SET description = 'Delicioso copão de 700ml com energético, gelo da sua escolha e dose especial' WHERE name ILIKE '%copão%' OR name ILIKE '%copao%';
UPDATE products SET description = 'Combo especial com bebidas e acompanhamentos' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%combo%');
UPDATE products SET description = 'Energético de qualidade para dar aquela energia' WHERE name ILIKE '%energético%' OR name ILIKE '%energetico%';
UPDATE products SET description = 'Dose especial de bebida alcoólica' WHERE category_id IN (SELECT id FROM categories WHERE name ILIKE '%dose%');

-- For products that didn't get a specific description, keep the default
COMMENT ON COLUMN products.description IS 'Descrição detalhada do produto';