-- Script để cập nhật age_group cho sản phẩm trẻ em
-- Chạy script này trong MySQL để đảm bảo sản phẩm trẻ em có age_group = 'kids'

USE clothing_store;

-- Xem các sản phẩm hiện tại (không có age_group = 'kids')
SELECT id, name, slug, category_id, age_group 
FROM products 
WHERE age_group != 'kids' OR age_group IS NULL
LIMIT 10;

-- Cập nhật age_group cho các sản phẩm trẻ em dựa trên category_id
-- Category IDs cho trẻ em:
-- 21: Áo Trẻ Em
-- 22: Quần Trẻ Em  
-- 23: Váy Trẻ Em
-- 24: Đầm Trẻ Em
-- 25: Bộ Đồ Trẻ Em

UPDATE products 
SET age_group = 'kids' 
WHERE category_id IN (21, 22, 23, 24, 25);

-- Xác nhận số sản phẩm đã được cập nhật
SELECT 
    age_group, 
    COUNT(*) as so_luong 
FROM products 
GROUP BY age_group;

-- Kiểm tra các sản phẩm trẻ em
SELECT id, name, slug, category_id, age_group 
FROM products 
WHERE age_group = 'kids';
