-- =====================================================
-- Cập nhật sản phẩm bán chạy (total_sold)
-- =====================================================

-- Sản phẩm Nam bán chạy
UPDATE products SET total_sold = FLOOR(50 + RAND() * 150) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('ao-thun-nam', 'ao-so-mi-nam', 'quan-jeans-nam', 'ao-polo-nam'))
  AND is_active = TRUE;

-- Sản phẩm Nữ bán chạy
UPDATE products SET total_sold = FLOOR(80 + RAND() * 200) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('dam-nu', 'ao-blouse-nu', 'chan-vay', 'ao-thun-nu'))
  AND is_active = TRUE;

-- Áo khoác - bán rất chạy
UPDATE products SET total_sold = FLOOR(100 + RAND() * 300) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('ao-khoac-nam', 'ao-khoac-nu'))
  AND is_active = TRUE;

-- Set đồ - bán khá chạy
UPDATE products SET total_sold = FLOOR(30 + RAND() * 100) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('set-do-nam', 'set-do-nu'))
  AND is_active = TRUE;

-- Phụ kiện - bán chạy vừa
UPDATE products SET total_sold = FLOOR(20 + RAND() * 80) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('tui-xach', 'mu-non', 'that-lung'))
  AND is_active = TRUE;

-- Trẻ em
UPDATE products SET total_sold = FLOOR(40 + RAND() * 120) 
WHERE category_id IN (SELECT id FROM categories WHERE slug LIKE '%tre-em%')
  AND is_active = TRUE;

-- Kiểm tra kết quả
SELECT 
  c.name AS category_name,
  COUNT(*) AS total_products,
  SUM(p.total_sold) AS total_sold,
  AVG(p.total_sold) AS avg_sold,
  MAX(p.total_sold) AS max_sold
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
GROUP BY c.id, c.name
ORDER BY total_sold DESC;

-- Top 10 sản phẩm bán chạy nhất
SELECT p.name, c.name AS category, p.total_sold, p.stock, p.price
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE
ORDER BY p.total_sold DESC
LIMIT 10;
