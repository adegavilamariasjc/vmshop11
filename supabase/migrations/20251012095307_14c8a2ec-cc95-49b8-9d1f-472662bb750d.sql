-- Aumentar 22% em todos os produtos e arredondar para .00 ou .50
UPDATE products
SET price = CASE
  -- Calcula o preço com 22% de aumento
  WHEN (price * 1.22)::numeric % 1 <= 0.25 THEN 
    -- Se decimal <= 0.25, arredonda para baixo (.00)
    FLOOR(price * 1.22)
  WHEN (price * 1.22)::numeric % 1 <= 0.75 THEN 
    -- Se 0.25 < decimal <= 0.75, arredonda para .50
    FLOOR(price * 1.22) + 0.5
  ELSE 
    -- Se decimal > 0.75, arredonda para cima (.00)
    CEIL(price * 1.22)
END;