-- =====================================================
-- CLOTHING STORE - Database Schema
-- E-commerce Platform for Fashion & Clothing
-- Complete Store Management System
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS clothing_store
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clothing_store;

-- =====================================================
-- TABLE: warehouses
-- =====================================================
CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_warehouses_code (code),
    INDEX idx_warehouses_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: suppliers
-- =====================================================
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    tax_code VARCHAR(50) DEFAULT NULL,
    contact_person VARCHAR(100) DEFAULT NULL,
    bank_account VARCHAR(50) DEFAULT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    debt_limit DECIMAL(15, 2) DEFAULT 0.00,
    total_debt DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_suppliers_code (code),
    INDEX idx_suppliers_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    avatar VARCHAR(500) DEFAULT NULL,
    role ENUM('user', 'admin', 'manager', 'staff') DEFAULT 'user',
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    id_card VARCHAR(20) DEFAULT NULL,
    default_city VARCHAR(100) DEFAULT NULL,
    default_district VARCHAR(100) DEFAULT NULL,
    default_ward VARCHAR(100) DEFAULT NULL,
    default_address TEXT DEFAULT NULL,
    reward_points INT DEFAULT 0,
    total_spent DECIMAL(15, 2) DEFAULT 0.00,
    order_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_phone (phone)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: employees
-- =====================================================
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    id_card VARCHAR(20) DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    position VARCHAR(100) DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    hire_date DATE DEFAULT NULL,
    salary DECIMAL(12, 2) DEFAULT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_user (user_id),
    INDEX idx_employees_active (is_active),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    image VARCHAR(500) DEFAULT NULL,
    icon VARCHAR(50) DEFAULT NULL,
    parent_id INT DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_sort (sort_order),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: brands
-- =====================================================
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo VARCHAR(500) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    country VARCHAR(100) DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_brands_slug (slug),
    INDEX idx_brands_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: sizes
-- =====================================================
CREATE TABLE sizes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    code VARCHAR(10) DEFAULT NULL,
    group_name VARCHAR(50) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sizes_sort (sort_order),
    INDEX idx_sizes_group (group_name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: colors
-- =====================================================
CREATE TABLE colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) DEFAULT NULL,
    hex_code VARCHAR(7) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_colors_sort (sort_order)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: products
-- =====================================================
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(12, 2) NOT NULL,
    compare_price DECIMAL(12, 2) DEFAULT NULL,
    cost_price DECIMAL(12, 2) DEFAULT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) DEFAULT NULL,
    stock INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    category_id INT DEFAULT NULL,
    brand_id INT DEFAULT NULL,
    gender ENUM('male', 'female', 'unisex', 'kids_boy', 'kids_girl') DEFAULT 'unisex',
    age_group ENUM('adult', 'teen', 'kids', 'all') DEFAULT 'adult',
    material VARCHAR(100) DEFAULT NULL,
    pattern VARCHAR(100) DEFAULT NULL,
    season VARCHAR(50) DEFAULT NULL,
    origin VARCHAR(100) DEFAULT NULL,
    total_sold INT DEFAULT 0,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_products_slug (slug),
    INDEX idx_products_category (category_id),
    INDEX idx_products_brand (brand_id),
    INDEX idx_products_sku (sku),
    INDEX idx_products_gender (gender),
    INDEX idx_products_featured (is_featured),
    INDEX idx_products_active (is_active),
    INDEX idx_products_price (price),
    INDEX idx_products_total_sold (total_sold),
    FULLTEXT idx_products_search (name, short_description, description),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: product_images
-- =====================================================
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_images_product (product_id),
    INDEX idx_images_sort (product_id, sort_order),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: product_variants
-- =====================================================
CREATE TABLE product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size_id INT DEFAULT NULL,
    color_id INT DEFAULT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) DEFAULT NULL,
    price_modifier DECIMAL(12, 2) DEFAULT 0.00,
    price DECIMAL(12, 2) DEFAULT NULL,
    cost_price DECIMAL(12, 2) DEFAULT NULL,
    stock INT DEFAULT 0,
    reserved_stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_variants_product (product_id),
    INDEX idx_variants_sku (sku),
    INDEX idx_variants_size (size_id),
    INDEX idx_variants_color (color_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
    FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: product_reviews
-- =====================================================
CREATE TABLE product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT DEFAULT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) DEFAULT NULL,
    content TEXT DEFAULT NULL,
    pros TEXT DEFAULT NULL,
    cons TEXT DEFAULT NULL,
    size_rating ENUM('too_small', 'small', 'fit', 'large', 'too_large') DEFAULT 'fit',
    images JSON DEFAULT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    admin_reply TEXT DEFAULT NULL,
    replied_at TIMESTAMP DEFAULT NULL,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reviews_product (product_id),
    INDEX idx_reviews_user (user_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_approved (is_approved),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: orders
-- =====================================================
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT DEFAULT NULL,
    invoice_number VARCHAR(50) DEFAULT NULL,
    tax_code VARCHAR(50) DEFAULT NULL,
    company_name VARCHAR(255) DEFAULT NULL,
    company_address TEXT DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned') DEFAULT 'pending',
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_id_card VARCHAR(20) DEFAULT NULL,
    shipping_full_address TEXT NOT NULL,
    shipping_city VARCHAR(100) DEFAULT NULL,
    shipping_district VARCHAR(100) DEFAULT NULL,
    shipping_ward VARCHAR(100) DEFAULT NULL,
    shipping_address TEXT NOT NULL,
    shipping_note TEXT DEFAULT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_code VARCHAR(50) DEFAULT NULL,
    discount_description VARCHAR(255) DEFAULT NULL,
    points_discount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('cod', 'bank_transfer', 'vnpay', 'momo', 'zalopay', 'cash', 'credit_card') DEFAULT 'cod',
    payment_status ENUM('unpaid', 'paid', 'partially_paid', 'refunded', 'failed') DEFAULT 'unpaid',
    payment_id VARCHAR(255) DEFAULT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    paid_at TIMESTAMP DEFAULT NULL,
    shipping_method VARCHAR(100) DEFAULT NULL,
    tracking_number VARCHAR(100) DEFAULT NULL,
    shipped_at TIMESTAMP DEFAULT NULL,
    delivered_at TIMESTAMP DEFAULT NULL,
    assigned_employee_id INT DEFAULT NULL,
    customer_note TEXT DEFAULT NULL,
    admin_note TEXT DEFAULT NULL,
    internal_note TEXT DEFAULT NULL,
    points_earned INT DEFAULT 0,
    points_used INT DEFAULT 0,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    refund_reason TEXT DEFAULT NULL,
    refunded_at TIMESTAMP DEFAULT NULL,
    confirmed_at TIMESTAMP DEFAULT NULL,
    cancelled_at TIMESTAMP DEFAULT NULL,
    cancel_reason VARCHAR(500) DEFAULT NULL,
    cancel_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_orders_number (order_number),
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_assigned (assigned_employee_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: order_items
-- =====================================================
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT DEFAULT NULL,
    variant_id INT DEFAULT NULL,
    supplier_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) DEFAULT NULL,
    product_image VARCHAR(500) DEFAULT NULL,
    variant_name VARCHAR(100) DEFAULT NULL,
    size_name VARCHAR(20) DEFAULT NULL,
    color_name VARCHAR(50) DEFAULT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    quantity_ordered INT DEFAULT 1,
    quantity_shipped INT DEFAULT 0,
    quantity_delivered INT DEFAULT 0,
    refund_quantity INT DEFAULT 0,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_product (product_id),
    INDEX idx_order_items_variant (variant_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: cart_items
-- =====================================================
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100) DEFAULT NULL,
    user_id INT DEFAULT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    is_selected BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cart_session (session_id),
    INDEX idx_cart_user (user_id),
    INDEX idx_cart_product (product_id),
    INDEX idx_cart_variant (variant_id),
    UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: wishlist
-- =====================================================
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    note VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wishlist_user (user_id),
    INDEX idx_wishlist_product (product_id),
    UNIQUE KEY unique_wishlist_item (user_id, product_id, variant_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: coupons
-- =====================================================
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    coupon_type ENUM('general', 'first_order', 'specific_product', 'specific_category', 'shipping', 'points') DEFAULT 'general',
    discount_type ENUM('percentage', 'fixed_amount', 'percentage_product', 'fixed_product') NOT NULL,
    discount_value DECIMAL(12, 2) NOT NULL,
    max_discount_amount DECIMAL(12, 2) DEFAULT NULL,
    min_order_amount DECIMAL(12, 2) DEFAULT 0.00,
    min_quantity INT DEFAULT NULL,
    max_usage_total INT DEFAULT NULL,
    max_usage_per_user INT DEFAULT 1,
    max_usage_per_day INT DEFAULT NULL,
    applicable_products JSON DEFAULT NULL,
    applicable_categories JSON DEFAULT NULL,
    applicable_users JSON DEFAULT NULL,
    exclude_products JSON DEFAULT NULL,
    points_required INT DEFAULT NULL,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    is_single_use BOOLEAN DEFAULT FALSE,
    used_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupons_code (code),
    INDEX idx_coupons_valid (valid_from, valid_until),
    INDEX idx_coupons_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: coupon_usage
-- =====================================================
CREATE TABLE coupon_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_coupon_usage_user (user_id),
    INDEX idx_coupon_usage_coupon (coupon_id),
    INDEX idx_coupon_usage_order (order_id),
    UNIQUE KEY unique_coupon_order (coupon_id, order_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: promotions
-- =====================================================
CREATE TABLE promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    banner VARCHAR(500) DEFAULT NULL,
    banner_url VARCHAR(500) DEFAULT NULL,
    promotion_type ENUM('flash_sale', 'buy_x_get_y', 'bundle', 'tier_discount', 'free_shipping', 'gift', 'points_boost') DEFAULT 'flash_sale',
    discount_type ENUM('percentage', 'fixed_amount', 'price') DEFAULT 'percentage',
    discount_value DECIMAL(12, 2) DEFAULT NULL,
    max_discount_amount DECIMAL(12, 2) DEFAULT NULL,
    buy_quantity INT DEFAULT NULL,
    get_quantity INT DEFAULT NULL,
    get_product_id INT DEFAULT NULL,
    get_discount_percent DECIMAL(5, 2) DEFAULT 100.00,
    bundle_product_ids JSON DEFAULT NULL,
    bundle_price DECIMAL(12, 2) DEFAULT NULL,
    tier_rules JSON DEFAULT NULL,
    min_order_amount DECIMAL(12, 2) DEFAULT 0.00,
    applicable_products JSON DEFAULT NULL,
    applicable_categories JSON DEFAULT NULL,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    max_per_user INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promotions_slug (slug),
    INDEX idx_promotions_type (promotion_type),
    INDEX idx_promotions_valid (valid_from, valid_until),
    INDEX idx_promotions_active (is_active),
    FOREIGN KEY (get_product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: reward_points
-- =====================================================
CREATE TABLE reward_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points INT NOT NULL,
    points_type ENUM('earn', 'redeem', 'expire', 'refund', 'bonus', 'adjustment') NOT NULL,
    balance_after DECIMAL(10, 2) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    order_id INT DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    expires_at TIMESTAMP DEFAULT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_points_user (user_id),
    INDEX idx_points_type (points_type),
    INDEX idx_points_order (order_id),
    INDEX idx_points_expires (expires_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: stock_movements
-- =====================================================
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    warehouse_id INT DEFAULT NULL,
    movement_type ENUM(
        'import',
        'export',
        'transfer_in',
        'transfer_out',
        'adjustment',
        'return_in',
        'return_out',
        'damage',
        'gift',
        'sample'
    ) NOT NULL,
    quantity INT NOT NULL,
    quantity_before INT DEFAULT NULL,
    quantity_after INT DEFAULT NULL,
    unit_cost DECIMAL(12, 2) DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    supplier_id INT DEFAULT NULL,
    employee_id INT DEFAULT NULL,
    reason VARCHAR(500) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT DEFAULT NULL,
    INDEX idx_stock_product (product_id),
    INDEX idx_stock_variant (variant_id),
    INDEX idx_stock_warehouse (warehouse_id),
    INDEX idx_stock_type (movement_type),
    INDEX idx_stock_reference (reference_type, reference_id),
    INDEX idx_stock_created (created_at),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: return_requests
-- =====================================================
CREATE TABLE return_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_code VARCHAR(50) NOT NULL UNIQUE,
    order_id INT NOT NULL,
    order_item_id INT DEFAULT NULL,
    user_id INT NOT NULL,
    reason_type ENUM(
        'wrong_item',
        'defective',
        'not_as_described',
        'size_issue',
        'changed_mind',
        'late_delivery',
        'other'
    ) NOT NULL,
    reason_description TEXT DEFAULT NULL,
    request_type ENUM('return', 'exchange', 'refund') DEFAULT 'return',
    requested_quantity INT DEFAULT 1,
    exchange_product_id INT DEFAULT NULL,
    exchange_variant_id INT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'received', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    admin_note TEXT DEFAULT NULL,
    processed_by INT DEFAULT NULL,
    processed_at TIMESTAMP DEFAULT NULL,
    refund_amount DECIMAL(12, 2) DEFAULT 0.00,
    points_refund INT DEFAULT 0,
    new_order_id INT DEFAULT NULL,
    images JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_returns_code (request_code),
    INDEX idx_returns_order (order_id),
    INDEX idx_returns_user (user_id),
    INDEX idx_returns_status (status),
    INDEX idx_returns_reason (reason_type),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (exchange_product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (exchange_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: news
-- =====================================================
CREATE TABLE news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary VARCHAR(500) DEFAULT NULL,
    content TEXT DEFAULT NULL,
    thumbnail VARCHAR(500) DEFAULT NULL,
    author_id INT DEFAULT NULL,
    author_name VARCHAR(100) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    tags JSON DEFAULT NULL,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP DEFAULT NULL,
    seo_title VARCHAR(255) DEFAULT NULL,
    seo_description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL,
    INDEX idx_news_slug (slug),
    INDEX idx_news_category (category),
    INDEX idx_news_published (is_published, published_at),
    INDEX idx_news_featured (is_featured),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: contacts
-- =====================================================
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    subject VARCHAR(255) DEFAULT NULL,
    message TEXT NOT NULL,
    contact_type ENUM('general', 'complaint', 'suggestion', 'partnership', 'warranty', 'recruitment') DEFAULT 'general',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('new', 'assigned', 'in_progress', 'replied', 'resolved', 'closed', 'archived') DEFAULT 'new',
    assigned_to INT DEFAULT NULL,
    admin_reply TEXT DEFAULT NULL,
    replied_at TIMESTAMP DEFAULT NULL,
    source ENUM('website', 'phone', 'email', 'social', 'in_person', 'other') DEFAULT 'website',
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contacts_status (status),
    INDEX idx_contacts_type (contact_type),
    INDEX idx_contacts_priority (priority),
    INDEX idx_contacts_email (email),
    INDEX idx_contacts_created (created_at),
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: settings
-- =====================================================
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT DEFAULT NULL,
    setting_type ENUM('string', 'number', 'boolean', 'json', 'array') DEFAULT 'string',
    group_name VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255) DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_settings_key (setting_key),
    INDEX idx_settings_group (group_name)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: shipping_providers
-- =====================================================
CREATE TABLE shipping_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    logo VARCHAR(500) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    tracking_url VARCHAR(500) DEFAULT NULL,
    api_key VARCHAR(255) DEFAULT NULL,
    api_secret VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_providers_code (code),
    INDEX idx_providers_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: shipping_zones
-- =====================================================
CREATE TABLE shipping_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cities JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: shipping_fees
-- =====================================================
CREATE TABLE shipping_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider_id INT NOT NULL,
    zone_id INT NOT NULL,
    min_weight DECIMAL(10, 2) DEFAULT 0.00,
    max_weight DECIMAL(10, 2) DEFAULT 5.00,
    base_fee DECIMAL(12, 2) NOT NULL,
    fee_per_kg DECIMAL(12, 2) DEFAULT 0.00,
    estimated_days_min INT DEFAULT 1,
    estimated_days_max INT DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_fees_provider (provider_id),
    INDEX idx_fees_zone (zone_id),
    FOREIGN KEY (provider_id) REFERENCES shipping_providers(id) ON DELETE CASCADE,
    FOREIGN KEY (zone_id) REFERENCES shipping_zones(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: payment_methods
-- =====================================================
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    icon VARCHAR(255) DEFAULT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    config JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_code (code),
    INDEX idx_payment_active (is_active)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: supplier_orders
-- =====================================================
CREATE TABLE supplier_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INT NOT NULL,
    warehouse_id INT DEFAULT NULL,
    employee_id INT DEFAULT NULL,
    status ENUM('draft', 'pending', 'confirmed', 'ordered', 'partial_received', 'received', 'cancelled') DEFAULT 'draft',
    order_date DATE DEFAULT NULL,
    expected_date DATE DEFAULT NULL,
    received_date DATE DEFAULT NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    paid_amount DECIMAL(15, 2) DEFAULT 0.00,
    payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
    payment_due_date DATE DEFAULT NULL,
    note TEXT DEFAULT NULL,
    internal_note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_supplier_orders_code (order_code),
    INDEX idx_supplier_orders_supplier (supplier_id),
    INDEX idx_supplier_orders_status (status),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: supplier_order_items
-- =====================================================
CREATE TABLE supplier_order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_order_id INT NOT NULL,
    product_id INT NOT NULL,
    variant_id INT DEFAULT NULL,
    size_id INT DEFAULT NULL,
    color_id INT DEFAULT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) DEFAULT NULL,
    variant_name VARCHAR(100) DEFAULT NULL,
    quantity_ordered INT NOT NULL DEFAULT 0,
    quantity_received INT DEFAULT 0,
    quantity_remaining INT DEFAULT 0,
    unit_cost DECIMAL(12, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0.00,
    total_cost DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_supplier_items_order (supplier_order_id),
    INDEX idx_supplier_items_product (product_id),
    FOREIGN KEY (supplier_order_id) REFERENCES supplier_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
    FOREIGN KEY (size_id) REFERENCES sizes(id) ON DELETE SET NULL,
    FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: expense_categories
-- =====================================================
CREATE TABLE expense_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    parent_id INT DEFAULT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expense_categories_code (code),
    FOREIGN KEY (parent_id) REFERENCES expense_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: expenses
-- =====================================================
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_code VARCHAR(50) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    warehouse_id INT DEFAULT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expense_date DATE NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'other') DEFAULT 'cash',
    supplier_id INT DEFAULT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id INT DEFAULT NULL,
    employee_id INT DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending',
    note TEXT DEFAULT NULL,
    receipt_image VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expenses_code (expense_code),
    INDEX idx_expenses_category (category_id),
    INDEX idx_expenses_date (expense_date),
    INDEX idx_expenses_status (status),
    FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: notifications
-- =====================================================
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON DEFAULT NULL,
    link VARCHAR(500) DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_type (type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: activity_logs
-- =====================================================
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) DEFAULT NULL,
    entity_id INT DEFAULT NULL,
    description TEXT DEFAULT NULL,
    changes JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent VARCHAR(500) DEFAULT NULL,
    device_info VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_logs_user (user_id),
    INDEX idx_logs_action (action),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
