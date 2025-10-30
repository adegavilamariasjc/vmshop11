-- Popular custos simulados para produtos sem custo definido
-- Lógica: produtos mais baratos têm margem menor (custo ~70% do preço)
--         produtos mais caros têm margem maior (custo ~50% do preço)

UPDATE products
SET custo_compra = CASE
  -- Produtos até R$ 10: custo = 70% do preço (margem ~43%)
  WHEN price <= 10 THEN ROUND(price * 0.70, 2)
  
  -- Produtos de R$ 10 a R$ 30: custo = 60% do preço (margem ~67%)
  WHEN price > 10 AND price <= 30 THEN ROUND(price * 0.60, 2)
  
  -- Produtos de R$ 30 a R$ 50: custo = 55% do preço (margem ~82%)
  WHEN price > 30 AND price <= 50 THEN ROUND(price * 0.55, 2)
  
  -- Produtos acima de R$ 50: custo = 50% do preço (margem 100%)
  ELSE ROUND(price * 0.50, 2)
END
WHERE custo_compra = 0 OR custo_compra IS NULL;

-- Recalcular a margem de lucro para todos os produtos
-- O trigger calculate_profit_margin já existe, mas vamos forçar o recálculo
UPDATE products
SET margem_lucro = CASE
  WHEN custo_compra > 0 THEN 
    ROUND(((price - custo_compra) / custo_compra) * 100, 2)
  ELSE 0
END
WHERE custo_compra > 0;