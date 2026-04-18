-- =====================================================
-- Thêm sản phẩm giảm giá cho SalePage
-- =====================================================

-- Update products có compare_price (giá gốc cao hơn price)
-- Mỗi sản phẩm sẽ có giá compare_price cao hơn price để hiển thị % giảm giá

-- Áo Thun Nam - giảm 15-25%
UPDATE products SET compare_price = ROUND(price * 1.25, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('ao-thun-nam', 'ao-polo-nam'));

UPDATE products SET compare_price = ROUND(price * 1.20, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'ao-so-mi-nam');

-- Quần Nam - giảm 10-20%
UPDATE products SET compare_price = ROUND(price * 1.15, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('quan-jeans-nam', 'quan-tay-nam', 'quan-short-nam'));

-- Áo Khoác Nam - giảm 30%
UPDATE products SET compare_price = ROUND(price * 1.30, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'ao-khoac-nam');

-- Nữ - giảm 15-25%
UPDATE products SET compare_price = ROUND(price * 1.20, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('ao-blouse-nu', 'ao-thun-nu', 'ao-croptop'));

UPDATE products SET compare_price = ROUND(price * 1.25, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('chan-vay', 'dam-nu', 'quan-nu'));

-- Áo Khoác Nữ - giảm 30%
UPDATE products SET compare_price = ROUND(price * 1.30, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug = 'ao-khoac-nu');

-- Trẻ em - giảm 20%
UPDATE products SET compare_price = ROUND(price * 1.20, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('ao-tre-em', 'quan-tre-em', 'vay-tre-em', 'dam-tre-em', 'bo-do-tre-em'));

-- Set đồ - giảm 25%
UPDATE products SET compare_price = ROUND(price * 1.25, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('set-do-nam', 'set-do-nu'));

-- Phụ kiện - giảm 10%
UPDATE products SET compare_price = ROUND(price * 1.10, -3) 
WHERE category_id IN (SELECT id FROM categories WHERE slug IN ('tui-xach', 'that-lung', 'khan-choang', 'mu-non'));

-- Kiểm tra kết quả
SELECT 
  c.name AS category_name,
  c.slug AS category_slug,
  COUNT(*) AS total_products,
  COUNT(CASE WHEN p.compare_price > p.price THEN 1 END) AS sale_products
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.compare_price > p.price
GROUP BY c.id, c.name, c.slug
ORDER BY sale_products DESC;
