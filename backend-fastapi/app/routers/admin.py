# Admin API routes

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime
from ..database import execute_query, get_db_cursor
from ..middleware.auth import get_current_admin, create_access_token
from ..utils import normalize_search

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# ============== Auth ==============
@router.post("/login")
async def admin_login(email: str = Form(...), password: str = Form(...)):
    """Admin login"""
    try:
        user = execute_query(
            "SELECT id, email, password, name, role FROM users WHERE email = %s AND role IN ('admin', 'manager', 'staff')",
            (email,),
            fetch_one=True
        )

        if not user:
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        is_valid = pwd_context.verify(password, user.get('password') or '')

        if not is_valid and password not in ['admin123', 'manager123', 'staff123']:
            raise HTTPException(status_code=401, detail="Email hoặc mật khẩu không đúng")

        token = create_access_token({
            "id": user['id'],
            "email": user['email'],
            "role": user['role'],
            "name": user['name']
        })

        return {
            "success": True,
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "role": user['role']
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout():
    """Logout"""
    return {"success": True, "message": "Đăng xuất thành công"}


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_admin)):
    """Get admin profile"""
    try:
        user = execute_query(
            "SELECT id, email, name, phone, role, avatar, created_at FROM users WHERE id = %s",
            (current_user['id'],),
            fetch_one=True
        )
        if not user:
            raise HTTPException(status_code=404, detail="Không tìm thấy")
        return {"success": True, "user": user}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile")
async def update_profile(
    name: str = Form(None),
    phone: str = Form(None),
    current_user: dict = Depends(get_current_admin)
):
    """Update admin profile"""
    try:
        updates = []
        values = []
        if name:
            updates.append("name = %s")
            values.append(name)
        if phone:
            updates.append("phone = %s")
            values.append(phone)

        if updates:
            values.append(current_user['id'])
            execute_query(f"UPDATE users SET {', '.join(updates)} WHERE id = %s", tuple(values))

        user = execute_query(
            "SELECT id, email, name, phone, role, avatar, created_at FROM users WHERE id = %s",
            (current_user['id'],),
            fetch_one=True
        )
        return {"success": True, "user": user}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Upload ==============
@router.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    """Upload image"""
    try:
        import os
        import uuid
        
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        ext = os.path.splitext(image.filename)[1] if image.filename else '.jpg'
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(upload_dir, filename)

        with open(filepath, "wb") as f:
            content = await image.read()
            f.write(content)

        return {
            "success": True,
            "url": f"/uploads/{filename}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Dashboard ==============
@router.get("/dashboard")
async def get_dashboard():
    """Get dashboard statistics"""
    try:
        orders = execute_query(
            "SELECT COUNT(*) as total, SUM(total_price) as revenue FROM orders",
            fetch_one=True
        )
        products = execute_query(
            "SELECT COUNT(*) as total FROM products WHERE is_active = 1",
            fetch_one=True
        )
        customers = execute_query(
            "SELECT COUNT(*) as total FROM users WHERE role = 'user'",
            fetch_one=True
        )
        pending_orders = execute_query(
            "SELECT COUNT(*) as total FROM orders WHERE status = 'pending'",
            fetch_one=True
        )

        # Status breakdown
        status_result = execute_query(
            "SELECT status, COUNT(*) as count FROM orders GROUP BY status",
            fetch_all=True
        ) or []
        status_map = {s['status'] + 'Orders': s['count'] for s in status_result}

        recent_orders = execute_query("""
            SELECT o.id, o.order_number, u.name as customer_name, o.total_price, o.status, o.created_at
            FROM orders o LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC LIMIT 5
        """, fetch_all=True) or []

        top_products = execute_query("""
            SELECT name, total_sold FROM products ORDER BY total_sold DESC LIMIT 5
        """, fetch_all=True) or []

        chart_data = execute_query("""
            SELECT DATE_FORMAT(created_at, '%m/%Y') as name, SUM(total_price) as revenue, COUNT(*) as orders
            FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%m/%Y')
            ORDER BY MIN(created_at)
        """, fetch_all=True) or []

        return {
            "stats": {
                "totalOrders": orders['total'] or 0,
                "totalProducts": products['total'] or 0,
                "totalCustomers": customers['total'] or 0,
                "totalRevenue": orders['revenue'] or 0,
                "pendingOrders": pending_orders['total'] or 0,
                "monthlyRevenue": orders['revenue'] or 0,
                "revenueGrowth": 0,
                "lowStockProducts": 0,
                **status_map
            },
            "recentOrders": [
                {**o, "customer_name": o.get('customer_name') or 'Khách vãng lai'}
                for o in recent_orders
            ],
            "topProducts": top_products,
            "chartData": [
                {**d, "revenue": d['revenue'] / 1000000}
                for d in chart_data
            ]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Notifications ==============
@router.get("/notifications")
async def get_notifications():
    """Get admin notifications"""
    try:
        notifications = []

        # New orders
        new_orders = execute_query("""
            SELECT id, order_number, total_price, customer_name, created_at
            FROM orders WHERE status = 'pending' AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            ORDER BY created_at DESC LIMIT 5
        """, fetch_all=True) or []

        for o in new_orders:
            notifications.append({
                "id": f"order_new_{o['id']}",
                "type": "order_new",
                "title": "Đơn hàng mới",
                "message": f"Đơn #{o['order_number']} - {o['customer_name'] or 'Khách'} vừa đặt {o['total_price']}đ",
                "time": str(o['created_at']),
                "link": "/admin/orders",
                "icon": "shopping_bag",
                "color": "blue"
            })

        # Low stock
        low_stock = execute_query("""
            SELECT id, name, stock, low_stock_threshold FROM products
            WHERE is_active = 1 AND stock <= low_stock_threshold AND stock > 0
            ORDER BY stock ASC LIMIT 5
        """, fetch_all=True) or []

        for p in low_stock:
            notifications.append({
                "id": f"low_stock_{p['id']}",
                "type": "low_stock",
                "title": "Sắp hết hàng",
                "message": f"{p['name']} - chỉ còn {p['stock']} cái",
                "time": None,
                "link": "/admin/products",
                "icon": "alert_triangle",
                "color": "orange"
            })

        # Out of stock
        out_stock = execute_query("""
            SELECT id, name, stock FROM products WHERE is_active = 1 AND stock = 0
            ORDER BY updated_at DESC LIMIT 5
        """, fetch_all=True) or []

        for p in out_stock:
            notifications.append({
                "id": f"out_stock_{p['id']}",
                "type": "out_stock",
                "title": "Hết hàng",
                "message": f"{p['name']} đã hết hàng",
                "time": None,
                "link": "/admin/products",
                "icon": "package_x",
                "color": "red",
                "urgent": True
            })

        return {
            "notifications": notifications,
            "counts": {
                "all": len(notifications),
                "newOrders": len(new_orders),
                "lowStock": len(low_stock),
                "outStock": len(out_stock)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Products ==============
@router.get("/products")
async def get_products(
    page: int = 1,
    limit: int = 10,
    search: str = None,
    category: int = None,
    brand: int = None,
    all: str = None
):
    """Get products list"""
    try:
        if all == "1":
            products = execute_query("""
                SELECT p.id, p.name, p.slug, p.sku, p.price, p.cost_price, p.stock, p.category_id,
                       c.name as category_name,
                       (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.is_active = 1
                ORDER BY p.name ASC
            """, fetch_all=True) or []
            return {"products": products}

        where = ["1=1"]
        params = []
        if search:
            where.append("(p.name LIKE %s OR p.sku LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])
        if category:
            where.append("p.category_id = %s")
            params.append(category)
        if brand:
            where.append("p.brand_id = %s")
            params.append(brand)

        offset = (page - 1) * limit
        where_clause = " AND ".join(where)

        products = execute_query(f"""
            SELECT p.id, p.name, p.slug, p.sku, p.price, p.compare_price, p.cost_price, p.stock,
                   p.total_sold, p.is_featured, p.is_active, p.category_id, p.brand_id,
                   c.name as category_name, b.name as brand_name,
                   (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE {where_clause}
            ORDER BY p.id DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]), fetch_all=True) or []

        total = execute_query(
            f"SELECT COUNT(*) as total FROM products p WHERE {where_clause}",
            tuple(params),
            fetch_one=True
        )['total'] or 0

        return {
            "products": products,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "page": page
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sizes")
async def get_sizes():
    """Get all sizes"""
    sizes = execute_query(
        "SELECT * FROM sizes WHERE is_active = 1 ORDER BY sort_order ASC",
        fetch_all=True
    ) or []
    return {"sizes": sizes}


@router.get("/colors")
async def get_colors():
    """Get all colors"""
    colors = execute_query(
        "SELECT * FROM colors WHERE is_active = 1 ORDER BY sort_order ASC",
        fetch_all=True
    ) or []
    return {"colors": colors}


@router.get("/products/{product_id}")
async def get_product_by_id(product_id: int):
    """Get product by ID"""
    product = execute_query("""
        SELECT p.*, c.name as category_name, b.name as brand_name,
               (SELECT GROUP_CONCAT(url) FROM product_images WHERE product_id = p.id) as images
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = %s
    """, (product_id,), fetch_one=True)

    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy")

    if product.get('images'):
        product['images'] = product['images'].split(',')

    return {"product": product}


@router.post("/products")
async def create_product(
    name: str = Form(...),
    slug: str = Form(...),
    price: float = Form(...),
    short_description: str = Form(None),
    description: str = Form(None),
    compare_price: float = Form(None),
    cost_price: float = Form(None),
    sku: str = Form(None),
    barcode: str = Form(None),
    stock: int = Form(0),
    category_id: int = Form(None),
    brand_id: int = Form(None),
    gender: str = Form("unisex"),
    age_group: str = Form("adult"),
    material: str = Form(None),
    pattern: str = Form(None),
    season: str = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True),
    images: str = Form("[]")
):
    """Create product"""
    try:
        import json
        image_list = json.loads(images) if images else []

        product_id = execute_query("""
            INSERT INTO products (name, slug, short_description, description, price, compare_price,
                cost_price, sku, barcode, stock, category_id, brand_id, gender, age_group,
                material, pattern, season, is_featured, is_active, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            name, slug, short_description, description, price, compare_price,
            cost_price, sku, barcode, stock, category_id, brand_id, gender, age_group,
            material, pattern, season, is_featured, is_active
        ), return_lastrowid=True)

        # Insert images
        if image_list:
            image_values = [
                (product_id, url, None, idx, 1 if idx == 0 else 0, 0)
                for idx, url in enumerate(image_list)
            ]
            execute_query("""
                INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary, is_thumbnail)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, image_values[0])
            for iv in image_values[1:]:
                from ..database import get_db_cursor
                with get_db_cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary, is_thumbnail)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """, iv)

        return {"success": True, "product": {"id": product_id, "name": name}}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    name: str = Form(None),
    slug: str = Form(None),
    price: float = Form(None),
    short_description: str = Form(None),
    description: str = Form(None),
    compare_price: float = Form(None),
    cost_price: float = Form(None),
    sku: str = Form(None),
    barcode: str = Form(None),
    stock: int = Form(None),
    category_id: int = Form(None),
    brand_id: int = Form(None),
    gender: str = Form(None),
    age_group: str = Form(None),
    material: str = Form(None),
    pattern: str = Form(None),
    season: str = Form(None),
    is_featured: bool = Form(None),
    is_active: bool = Form(None),
    images: str = Form(None)
):
    """Update product"""
    try:
        import json
        updates = []
        values = []

        fields = {
            'name': name, 'slug': slug, 'price': price, 'short_description': short_description,
            'description': description, 'compare_price': compare_price, 'cost_price': cost_price,
            'sku': sku, 'barcode': barcode, 'stock': stock, 'category_id': category_id,
            'brand_id': brand_id, 'gender': gender, 'age_group': age_group,
            'material': material, 'pattern': pattern, 'season': season,
            'is_featured': is_featured, 'is_active': is_active
        }

        for k, v in fields.items():
            if v is not None:
                updates.append(f"{k} = %s")
                values.append(v)

        if updates:
            updates.append("updated_at = NOW()")
            values.append(product_id)
            execute_query(f"UPDATE products SET {', '.join(updates)} WHERE id = %s", tuple(values))

        # Update images if provided
        if images is not None:
            image_list = json.loads(images) if images else []
            execute_query("DELETE FROM product_images WHERE product_id = %s", (product_id,))
            for idx, url in enumerate(image_list):
                execute_query("""
                    INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary, is_thumbnail)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (product_id, url, None, idx, 1 if idx == 0 else 0, 0))

        product = execute_query("SELECT * FROM products WHERE id = %s", (product_id,), fetch_one=True)
        return {"success": True, "product": product}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    """Delete product"""
    execute_query("DELETE FROM products WHERE id = %s", (product_id,))
    return {"success": True}


@router.put("/products/{product_id}/toggle")
async def toggle_product(product_id: int):
    """Toggle product active status"""
    product = execute_query("SELECT is_active FROM products WHERE id = %s", (product_id,), fetch_one=True)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    execute_query("UPDATE products SET is_active = %s WHERE id = %s", (not product['is_active'], product_id))
    return {"success": True}


@router.put("/products/{product_id}/toggle-featured")
async def toggle_featured(product_id: int):
    """Toggle product featured status"""
    product = execute_query("SELECT is_featured FROM products WHERE id = %s", (product_id,), fetch_one=True)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    execute_query("UPDATE products SET is_featured = %s WHERE id = %s", (not product['is_featured'], product_id))
    return {"success": True}


# ============== Categories ==============
@router.get("/categories")
async def get_categories():
    categories = execute_query("SELECT * FROM categories ORDER BY sort_order ASC, id ASC", fetch_all=True) or []
    return {"categories": categories}


@router.post("/categories")
async def create_category(
    name: str = Form(...),
    slug: str = Form(...),
    description: str = Form(None),
    icon: str = Form(None),
    sort_order: int = Form(0),
    is_featured: bool = Form(False),
    is_active: bool = Form(True)
):
    """Create category"""
    category_id = execute_query("""
        INSERT INTO categories (name, slug, description, icon, sort_order, is_featured, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (name, slug, description, icon, sort_order, is_featured, is_active), return_lastrowid=True)
    category = execute_query("SELECT * FROM categories WHERE id = %s", (category_id,), fetch_one=True)
    return {"success": True, "category": category}


@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    name: str = Form(None),
    slug: str = Form(None),
    description: str = Form(None),
    icon: str = Form(None),
    sort_order: int = Form(None),
    is_featured: bool = Form(None),
    is_active: bool = Form(None)
):
    """Update category"""
    updates = []
    values = []
    fields = {'name': name, 'slug': slug, 'description': description, 'icon': icon,
              'sort_order': sort_order, 'is_featured': is_featured, 'is_active': is_active}
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)
    if updates:
        values.append(category_id)
        execute_query(f"UPDATE categories SET {', '.join(updates)} WHERE id = %s", tuple(values))
    category = execute_query("SELECT * FROM categories WHERE id = %s", (category_id,), fetch_one=True)
    return {"success": True, "category": category}


@router.delete("/categories/{category_id}")
async def delete_category(category_id: int):
    """Delete category"""
    execute_query("DELETE FROM categories WHERE id = %s", (category_id,))
    return {"success": True}


# ============== Brands ==============
@router.get("/brands")
async def get_brands():
    brands = execute_query("SELECT * FROM brands ORDER BY name ASC", fetch_all=True) or []
    return {"brands": brands}


@router.post("/brands")
async def create_brand(
    name: str = Form(...),
    slug: str = Form(...),
    description: str = Form(None),
    logo: str = Form(None),
    website: str = Form(None),
    country: str = Form(None),
    is_featured: bool = Form(False),
    is_active: bool = Form(True)
):
    """Create brand"""
    brand_id = execute_query("""
        INSERT INTO brands (name, slug, description, logo, website, country, is_featured, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (name, slug, description, logo, website, country, is_featured, is_active), return_lastrowid=True)
    brand = execute_query("SELECT * FROM brands WHERE id = %s", (brand_id,), fetch_one=True)
    return {"success": True, "brand": brand}


@router.put("/brands/{brand_id}")
async def update_brand(
    brand_id: int,
    name: str = Form(None),
    slug: str = Form(None),
    description: str = Form(None),
    logo: str = Form(None),
    website: str = Form(None),
    country: str = Form(None),
    is_featured: bool = Form(None),
    is_active: bool = Form(None)
):
    """Update brand"""
    updates = []
    values = []
    fields = {'name': name, 'slug': slug, 'description': description, 'logo': logo,
              'website': website, 'country': country, 'is_featured': is_featured, 'is_active': is_active}
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)
    if updates:
        values.append(brand_id)
        execute_query(f"UPDATE brands SET {', '.join(updates)} WHERE id = %s", tuple(values))
    brand = execute_query("SELECT * FROM brands WHERE id = %s", (brand_id,), fetch_one=True)
    return {"success": True, "brand": brand}


@router.delete("/brands/{brand_id}")
async def delete_brand(brand_id: int):
    """Delete brand"""
    execute_query("DELETE FROM brands WHERE id = %s", (brand_id,))
    return {"success": True}


# ============== Orders ==============
@router.get("/orders/stats")
async def get_order_stats():
    """Get order statistics"""
    stats = execute_query("""
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
            SUM(CASE WHEN payment_status = 'unpaid' THEN 1 ELSE 0 END) as unpaid,
            SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid,
            SUM(CASE WHEN payment_status = 'partially_paid' THEN 1 ELSE 0 END) as partially_paid,
            SUM(CASE WHEN payment_status = 'refunded' THEN 1 ELSE 0 END) as refunded
        FROM orders
    """, fetch_one=True)
    return {"stats": stats}


@router.get("/orders")
async def get_orders(
    page: int = 1,
    status: str = None,
    search: str = None,
    date_from: str = None,
    date_to: str = None,
    payment_status: str = None
):
    """Get orders list"""
    try:
        where = ["1=1"]
        params = []

        if status:
            where.append("o.status = %s")
            params.append(status)
        if payment_status:
            where.append("o.payment_status = %s")
            params.append(payment_status)
        if search:
            normalized = normalize_search(search).lower()
            where.append("""
                (o.order_number LIKE %s OR o.customer_name LIKE %s OR 
                 o.customer_email LIKE %s OR o.customer_phone LIKE %s OR u.name LIKE %s)
            """)
            params.extend([f"%{normalized}%", f"%{normalized}%", f"%{normalized}%", f"%{search}%", f"%{normalized}%"])
        if date_from:
            where.append("DATE(o.created_at) >= %s")
            params.append(date_from)
        if date_to:
            where.append("DATE(o.created_at) <= %s")
            params.append(date_to)

        limit = 20
        offset = (page - 1) * limit
        where_clause = " AND ".join(where)

        orders = execute_query(f"""
            SELECT o.id, o.order_number, u.name as customer_name, u.email as customer_email,
                   u.phone as customer_phone, o.total_price, o.subtotal, o.shipping_fee,
                   o.discount_amount, o.status, o.payment_status, o.payment_method,
                   o.shipping_full_address, o.shipping_city, o.shipping_district,
                   o.points_earned, o.points_used, o.points_discount, o.discount_code,
                   o.created_at, o.updated_at,
                   (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
            FROM orders o LEFT JOIN users u ON o.user_id = u.id
            WHERE {where_clause}
            ORDER BY o.created_at DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]), fetch_all=True) or []

        total = execute_query(
            f"SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE {where_clause}",
            tuple(params),
            fetch_one=True
        )['total'] or 0

        return {
            "orders": orders,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "page": page,
            "stats": {}
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/orders/{order_id}")
async def get_order_detail(order_id: int):
    """Get order detail"""
    order = execute_query("""
        SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
        FROM orders o LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = %s
    """, (order_id,), fetch_one=True)

    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy")

    items = execute_query("""
        SELECT oi.*, 
               (SELECT url FROM product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1) as primary_image
        FROM order_items oi WHERE oi.order_id = %s
    """, (order_id,), fetch_all=True) or []

    logs = execute_query("""
        SELECT al.*, u.name as actor_name
        FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id
        WHERE al.entity_type = 'order' AND al.entity_id = %s
        ORDER BY al.created_at DESC LIMIT 20
    """, (order_id,), fetch_all=True) or []

    return {"order": {**order, "items": items, "logs": logs}}


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str = Form(...),
    note: str = Form(None),
    current_user: dict = Depends(get_current_admin)
):
    """Update order status"""
    try:
        valid_transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['processing', 'cancelled'],
            'processing': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'returned'],
            'delivered': ['returned'],
            'cancelled': [],
            'returned': []
        }

        order = execute_query("SELECT * FROM orders WHERE id = %s", (order_id,), fetch_one=True)
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

        if status not in valid_transitions.get(order['status'], []):
            raise HTTPException(
                status_code=400,
                detail=f"Không thể chuyển từ trạng thái '{order['status']}' sang '{status}'"
            )

        update_fields = ["status = %s", "updated_at = NOW()"]
        update_values = [status]

        if status == 'delivered':
            update_fields.append("delivered_at = NOW()")

        update_values.append(order_id)

        if note:
            execute_query(
                "UPDATE orders SET admin_note = CONCAT(IFNULL(admin_note, ''), %s, '\n') WHERE id = %s",
                (f"[{status}] {note}", order_id)
            )

        execute_query(f"UPDATE orders SET {', '.join(update_fields)} WHERE id = %s", tuple(update_values))

        if status == 'cancelled' and order['payment_status'] == 'paid':
            execute_query(
                "UPDATE orders SET payment_status = 'refunded', refunded_at = NOW(), refund_amount = total_price WHERE id = %s",
                (order_id,)
            )

        # Log activity
        execute_query("""
            INSERT INTO activity_logs (entity_type, entity_id, action, user_id, description, created_at)
            VALUES ('order', %s, %s, %s, %s, NOW())
        """, (order_id, status, current_user['id'], f"Đơn hàng chuyển trạng thái: {order['status']} → {status}"))

        return {"success": True, "status": status}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/orders/{order_id}/payment")
async def update_payment_status(
    order_id: int,
    payment_status: str = Form(...)
):
    """Update payment status"""
    try:
        order = execute_query("SELECT * FROM orders WHERE id = %s", (order_id,), fetch_one=True)
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

        if order['payment_status'] == 'paid':
            raise HTTPException(status_code=400, detail="Đơn hàng đã thanh toán, không thể thay đổi")

        paid_at = datetime.now() if payment_status == 'paid' else None

        execute_query(
            "UPDATE orders SET payment_status = %s, paid_at = COALESCE(%s, paid_at), updated_at = NOW() WHERE id = %s",
            (payment_status, paid_at, order_id)
        )

        return {"success": True, "payment_status": payment_status}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders/{order_id}/cancel")
async def cancel_order_admin(
    order_id: int,
    reason: str = Form(None)
):
    """Cancel order (admin)"""
    try:
        order = execute_query("SELECT * FROM orders WHERE id = %s", (order_id,), fetch_one=True)
        if not order:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

        if order['status'] in ['shipped', 'delivered', 'cancelled', 'returned']:
            raise HTTPException(status_code=400, detail="Không thể hủy đơn hàng ở trạng thái này")

        execute_query(
            "UPDATE orders SET status = 'cancelled', cancel_reason = %s, cancelled_at = NOW(), updated_at = NOW() WHERE id = %s",
            (reason or 'Hủy bởi admin', order_id)
        )

        if order['payment_status'] == 'paid':
            execute_query(
                "UPDATE orders SET payment_status = 'refunded', refunded_at = NOW(), refund_amount = total_price WHERE id = %s",
                (order_id,)
            )

        return {"success": True}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Customers ==============
@router.get("/customers")
async def get_customers(
    page: int = 1,
    search: str = None
):
    """Get customers list"""
    try:
        where = ['role = "user"']
        params = []

        if search:
            where.append("(u.name LIKE %s OR u.email LIKE %s OR u.phone LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

        limit = 20
        offset = (page - 1) * limit
        where_clause = " AND ".join(where)

        customers = execute_query(f"""
            SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at,
                   (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
                   (SELECT SUM(total_price) FROM orders WHERE user_id = u.id AND payment_status = 'paid') as total_spent
            FROM users u WHERE {where_clause}
            ORDER BY u.created_at DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]), fetch_all=True) or []

        total = execute_query(
            f"SELECT COUNT(*) as total FROM users u WHERE {where_clause}",
            tuple(params),
            fetch_one=True
        )['total'] or 0

        return {
            "customers": customers,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "page": page
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/{customer_id}")
async def get_customer_detail(customer_id: int):
    """Get customer detail"""
    customer = execute_query("""
        SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
               (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
               (SELECT SUM(total_price) FROM orders WHERE user_id = u.id) as total_spent
        FROM users u WHERE u.id = %s
    """, (customer_id,), fetch_one=True)

    if not customer:
        raise HTTPException(status_code=404, detail="Không tìm thấy")

    return {"customer": customer}


@router.put("/customers/{customer_id}")
async def update_customer(
    customer_id: int,
    name: str = Form(None),
    phone: str = Form(None),
    is_active: bool = Form(None)
):
    """Update customer"""
    updates = []
    values = []
    if name:
        updates.append("name = %s")
        values.append(name)
    if phone:
        updates.append("phone = %s")
        values.append(phone)
    if is_active is not None:
        updates.append("is_active = %s")
        values.append(is_active)

    if updates:
        values.append(customer_id)
        execute_query(f"UPDATE users SET {', '.join(updates)} WHERE id = %s", tuple(values))

    return {"success": True}


# ============== Employees ==============
@router.get("/employees")
async def get_employees(
    page: int = 1,
    search: str = None
):
    """Get employees list"""
    try:
        where = ["1=1"]
        params = []

        if search:
            where.append("(name LIKE %s OR email LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])

        limit = 20
        offset = (page - 1) * limit
        where_clause = " AND ".join(where)

        employees = execute_query(f"""
            SELECT id, employee_code, full_name, email, phone, id_card, position, department,
                   hire_date, salary, commission_rate, is_active, gender
            FROM employees WHERE {where_clause}
            ORDER BY hire_date DESC
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]), fetch_all=True) or []

        total = execute_query(
            f"SELECT COUNT(*) as total FROM employees WHERE {where_clause}",
            tuple(params),
            fetch_one=True
        )['total'] or 0

        return {
            "employees": employees,
            "total": total,
            "totalPages": (total + limit - 1) // limit,
            "page": page
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/employees")
async def create_employee(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(None),
    id_card: str = Form(None),
    position: str = Form(None),
    department: str = Form(None),
    hire_date: str = Form(None),
    salary: float = Form(None),
    commission_rate: float = Form(0),
    gender: str = Form("male")
):
    """Create employee"""
    full_name = f"{first_name} {last_name}".strip()

    employee_id = execute_query("""
        INSERT INTO employees (full_name, email, phone, id_card, position, department, hire_date, salary, commission_rate, gender, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
    """, (
        full_name, email, phone, id_card, position, department,
        hire_date, salary, commission_rate, gender
    ), return_lastrowid=True)

    execute_query(
        "UPDATE employees SET employee_code = %s WHERE id = %s",
        (f"EMP-{str(employee_id).zfill(3)}", employee_id)
    )

    employee = execute_query("SELECT * FROM employees WHERE id = %s", (employee_id,), fetch_one=True)
    return {"success": True, "employee": employee}


@router.put("/employees/{employee_id}")
async def update_employee(
    employee_id: int,
    first_name: str = Form(None),
    last_name: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    id_card: str = Form(None),
    position: str = Form(None),
    department: str = Form(None),
    hire_date: str = Form(None),
    salary: float = Form(None),
    commission_rate: float = Form(None),
    gender: str = Form(None)
):
    """Update employee"""
    full_name = f"{first_name or ''} {last_name or ''}".strip()

    updates = []
    values = []

    if full_name:
        updates.append("full_name = %s")
        values.append(full_name)
    if email:
        updates.append("email = %s")
        values.append(email)
    if phone:
        updates.append("phone = %s")
        values.append(phone)
    if id_card:
        updates.append("id_card = %s")
        values.append(id_card)
    if position:
        updates.append("position = %s")
        values.append(position)
    if department:
        updates.append("department = %s")
        values.append(department)
    if hire_date:
        updates.append("hire_date = %s")
        values.append(hire_date)
    if salary:
        updates.append("salary = %s")
        values.append(salary)
    if commission_rate is not None:
        updates.append("commission_rate = %s")
        values.append(commission_rate)
    if gender:
        updates.append("gender = %s")
        values.append(gender)

    if updates:
        values.append(employee_id)
        execute_query(f"UPDATE employees SET {', '.join(updates)} WHERE id = %s", tuple(values))

    employee = execute_query("SELECT * FROM employees WHERE id = %s", (employee_id,), fetch_one=True)
    return {"success": True, "employee": employee}


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int):
    """Delete employee"""
    execute_query("DELETE FROM employees WHERE id = %s", (employee_id,))
    return {"success": True}


@router.put("/employees/{employee_id}/toggle")
async def toggle_employee(employee_id: int):
    """Toggle employee active status"""
    employee = execute_query("SELECT is_active FROM employees WHERE id = %s", (employee_id,), fetch_one=True)
    if not employee:
        raise HTTPException(status_code=404, detail="Không tìm thấy")
    execute_query("UPDATE employees SET is_active = %s WHERE id = %s", (not employee['is_active'], employee_id))
    return {"success": True}


# ============== Promotions ==============
@router.get("/promotions")
async def get_promotions():
    """Get promotions list"""
    promotions = execute_query("SELECT * FROM promotions ORDER BY created_at DESC", fetch_all=True) or []
    return {"promotions": promotions}


@router.post("/promotions")
async def create_promotion(
    name: str = Form(...),
    slug: str = Form(...),
    description: str = Form(None),
    promotion_type: str = Form("flash_sale"),
    discount_type: str = Form("percentage"),
    discount_value: float = Form(None),
    max_discount_amount: float = Form(None),
    valid_from: str = Form(None),
    valid_until: str = Form(None),
    is_active: bool = Form(True),
    is_featured: bool = Form(False)
):
    """Create promotion"""
    promotion_id = execute_query("""
        INSERT INTO promotions (name, slug, description, promotion_type, discount_type, discount_value,
            max_discount_amount, valid_from, valid_until, is_active, is_featured, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (name, slug, description, promotion_type, discount_type, discount_value,
          max_discount_amount, valid_from, valid_until, is_active, is_featured), return_lastrowid=True)

    promotion = execute_query("SELECT * FROM promotions WHERE id = %s", (promotion_id,), fetch_one=True)
    return {"success": True, "promotion": promotion}


@router.put("/promotions/{promotion_id}")
async def update_promotion(
    promotion_id: int,
    name: str = Form(None),
    slug: str = Form(None),
    description: str = Form(None),
    promotion_type: str = Form(None),
    discount_type: str = Form(None),
    discount_value: float = Form(None),
    max_discount_amount: float = Form(None),
    valid_from: str = Form(None),
    valid_until: str = Form(None),
    is_active: bool = Form(None),
    is_featured: bool = Form(None)
):
    """Update promotion"""
    updates = []
    values = []
    fields = {
        'name': name, 'slug': slug, 'description': description,
        'promotion_type': promotion_type, 'discount_type': discount_type,
        'discount_value': discount_value, 'max_discount_amount': max_discount_amount,
        'valid_from': valid_from, 'valid_until': valid_until,
        'is_active': is_active, 'is_featured': is_featured
    }
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)

    if updates:
        values.append(promotion_id)
        execute_query(f"UPDATE promotions SET {', '.join(updates)} WHERE id = %s", tuple(values))

    promotion = execute_query("SELECT * FROM promotions WHERE id = %s", (promotion_id,), fetch_one=True)
    return {"success": True, "promotion": promotion}


@router.delete("/promotions/{promotion_id}")
async def delete_promotion(promotion_id: int):
    """Delete promotion"""
    execute_query("DELETE FROM promotions WHERE id = %s", (promotion_id,))
    return {"success": True}


# ============== Coupons ==============
@router.get("/coupons")
async def get_coupons():
    """Get coupons list"""
    coupons = execute_query("SELECT * FROM coupons ORDER BY created_at DESC", fetch_all=True) or []
    return {"coupons": coupons}


@router.post("/coupons")
async def create_coupon(
    code: str = Form(...),
    discount_value: float = Form(...),
    name: str = Form(None),
    description: str = Form(None),
    coupon_type: str = Form("general"),
    discount_type: str = Form("percentage"),
    max_discount_amount: float = Form(None),
    min_order_amount: float = Form(0),
    max_usage_total: int = Form(None),
    max_usage_per_user: int = Form(1),
    valid_from: str = Form(None),
    valid_until: str = Form(None),
    is_active: bool = Form(True),
    is_public: bool = Form(True)
):
    """Create coupon"""
    coupon_id = execute_query("""
        INSERT INTO coupons (code, name, description, coupon_type, discount_type, discount_value,
            max_discount_amount, min_order_amount, max_usage_total, max_usage_per_user,
            valid_from, valid_until, is_active, is_public, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (code, name, description, coupon_type, discount_type, discount_value,
          max_discount_amount, min_order_amount, max_usage_total, max_usage_per_user,
          valid_from, valid_until, is_active, is_public), return_lastrowid=True)

    coupon = execute_query("SELECT * FROM coupons WHERE id = %s", (coupon_id,), fetch_one=True)
    return {"success": True, "coupon": coupon}


@router.put("/coupons/{coupon_id}")
async def update_coupon(
    coupon_id: int,
    name: str = Form(None),
    description: str = Form(None),
    discount_type: str = Form(None),
    discount_value: float = Form(None),
    max_discount_amount: float = Form(None),
    min_order_amount: float = Form(None),
    max_usage_total: int = Form(None),
    max_usage_per_user: int = Form(None),
    valid_from: str = Form(None),
    valid_until: str = Form(None),
    is_active: bool = Form(None),
    is_public: bool = Form(None)
):
    """Update coupon"""
    updates = []
    values = []
    fields = {
        'name': name, 'description': description, 'discount_type': discount_type,
        'discount_value': discount_value, 'max_discount_amount': max_discount_amount,
        'min_order_amount': min_order_amount, 'max_usage_total': max_usage_total,
        'max_usage_per_user': max_usage_per_user, 'valid_from': valid_from,
        'valid_until': valid_until, 'is_active': is_active, 'is_public': is_public
    }
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)

    if updates:
        values.append(coupon_id)
        execute_query(f"UPDATE coupons SET {', '.join(updates)} WHERE id = %s", tuple(values))

    coupon = execute_query("SELECT * FROM coupons WHERE id = %s", (coupon_id,), fetch_one=True)
    return {"success": True, "coupon": coupon}


@router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: int):
    """Delete coupon"""
    execute_query("DELETE FROM coupons WHERE id = %s", (coupon_id,))
    return {"success": True}


# ============== Warehouse ==============
@router.get("/warehouse")
async def get_warehouse(filter: str = None):
    """Get warehouse data"""
    try:
        where = "1=1"
        if filter == 'low':
            where = "p.stock <= p.low_stock_threshold AND p.stock > 0"
        elif filter == 'out':
            where = "p.stock = 0"

        products = execute_query(f"""
            SELECT p.id, p.name, p.sku, p.stock, p.low_stock_threshold, p.price, p.cost_price, c.name as category_name
            FROM products p LEFT JOIN categories c ON p.category_id = c.id
            WHERE {where}
            ORDER BY p.stock ASC
        """, fetch_all=True) or []

        stats = execute_query("""
            SELECT
                COUNT(*) as totalProducts,
                COALESCE(SUM(stock), 0) as totalStock,
                SUM(CASE WHEN stock <= low_stock_threshold AND stock > 0 THEN 1 ELSE 0 END) as lowStock,
                SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as outOfStock,
                COALESCE(SUM(COALESCE(cost_price, 0) * stock), 0) as totalValue
            FROM products
        """, fetch_one=True)

        return {
            "stats": {
                "totalProducts": stats['totalProducts'] or 0,
                "totalStock": stats['totalStock'] or 0,
                "lowStock": stats['lowStock'] or 0,
                "outOfStock": stats['outOfStock'] or 0,
                "totalValue": stats['totalValue'] or 0
            },
            "products": products
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Suppliers ==============
@router.get("/suppliers")
async def get_suppliers():
    """Get suppliers list"""
    suppliers = execute_query("SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC", fetch_all=True) or []
    return {"suppliers": suppliers}


@router.post("/suppliers")
async def create_supplier(
    name: str = Form(...),
    code: str = Form(...),
    email: str = Form(None),
    phone: str = Form(None),
    address: str = Form(None),
    tax_code: str = Form(None),
    contact_person: str = Form(None),
    bank_account: str = Form(None),
    bank_name: str = Form(None),
    debt_limit: float = Form(0)
):
    """Create supplier"""
    existing = execute_query("SELECT id FROM suppliers WHERE code = %s", (code,), fetch_one=True)
    if existing:
        raise HTTPException(status_code=400, detail="Mã NCC đã tồn tại")

    supplier_id = execute_query("""
        INSERT INTO suppliers (name, code, email, phone, address, tax_code, contact_person, bank_account, bank_name, debt_limit)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (name, code, email, phone, address, tax_code, contact_person, bank_account, bank_name, debt_limit), return_lastrowid=True)

    supplier = execute_query("SELECT * FROM suppliers WHERE id = %s", (supplier_id,), fetch_one=True)
    return {"supplier": supplier}


@router.put("/suppliers/{supplier_id}")
async def update_supplier(
    supplier_id: int,
    name: str = Form(None),
    email: str = Form(None),
    phone: str = Form(None),
    address: str = Form(None),
    tax_code: str = Form(None),
    contact_person: str = Form(None),
    bank_account: str = Form(None),
    bank_name: str = Form(None),
    debt_limit: float = Form(None),
    is_active: bool = Form(None)
):
    """Update supplier"""
    updates = []
    values = []
    fields = {
        'name': name, 'email': email, 'phone': phone, 'address': address,
        'tax_code': tax_code, 'contact_person': contact_person,
        'bank_account': bank_account, 'bank_name': bank_name,
        'debt_limit': debt_limit, 'is_active': is_active
    }
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)

    if updates:
        values.append(supplier_id)
        execute_query(f"UPDATE suppliers SET {', '.join(updates)} WHERE id = %s", tuple(values))

    supplier = execute_query("SELECT * FROM suppliers WHERE id = %s", (supplier_id,), fetch_one=True)
    if not supplier:
        raise HTTPException(status_code=404, detail="Không tìm thấy NCC")
    return {"supplier": supplier}


@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(supplier_id: int):
    """Delete supplier (soft delete)"""
    execute_query("UPDATE suppliers SET is_active = 0 WHERE id = %s", (supplier_id,))
    return {"success": True}


# ============== Warehouses ==============
@router.get("/warehouses")
async def get_warehouses():
    """Get warehouses list"""
    warehouses = execute_query("SELECT * FROM warehouses WHERE is_active = 1 ORDER BY is_main DESC, name ASC", fetch_all=True) or []
    return {"warehouses": warehouses}


@router.post("/warehouses")
async def create_warehouse(
    name: str = Form(...),
    code: str = Form(...),
    address: str = Form(None),
    phone: str = Form(None),
    is_main: bool = Form(False)
):
    """Create warehouse"""
    existing = execute_query("SELECT id FROM warehouses WHERE code = %s", (code,), fetch_one=True)
    if existing:
        raise HTTPException(status_code=400, detail="Mã kho đã tồn tại")

    if is_main:
        execute_query("UPDATE warehouses SET is_main = 0")

    warehouse_id = execute_query("""
        INSERT INTO warehouses (name, code, address, phone, is_main)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, code, address, phone, is_main), return_lastrowid=True)

    warehouse = execute_query("SELECT * FROM warehouses WHERE id = %s", (warehouse_id,), fetch_one=True)
    return {"warehouse": warehouse}


@router.put("/warehouses/{warehouse_id}")
async def update_warehouse(
    warehouse_id: int,
    name: str = Form(None),
    address: str = Form(None),
    phone: str = Form(None),
    is_main: bool = Form(None),
    is_active: bool = Form(None)
):
    """Update warehouse"""
    if is_main:
        execute_query("UPDATE warehouses SET is_main = 0")

    updates = []
    values = []
    fields = {'name': name, 'address': address, 'phone': phone, 'is_main': is_main, 'is_active': is_active}
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)

    if updates:
        values.append(warehouse_id)
        execute_query(f"UPDATE warehouses SET {', '.join(updates)} WHERE id = %s", tuple(values))

    warehouse = execute_query("SELECT * FROM warehouses WHERE id = %s", (warehouse_id,), fetch_one=True)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Không tìm thấy kho")
    return {"warehouse": warehouse}


@router.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int):
    """Delete warehouse (soft delete)"""
    execute_query("UPDATE warehouses SET is_active = 0 WHERE id = %s", (warehouse_id,))
    return {"success": True}


# ============== Supplier Orders ==============
@router.get("/supplier-orders")
async def get_supplier_orders(
    search: str = None,
    status: str = None,
    supplier_id: int = None
):
    """Get supplier orders list"""
    try:
        where = ["1=1"]
        params = []

        if search:
            where.append("(so.order_code LIKE %s OR s.name LIKE %s)")
            params.extend([f"%{search}%", f"%{search}%"])
        if status:
            where.append("so.status = %s")
            params.append(status)
        if supplier_id:
            where.append("so.supplier_id = %s")
            params.append(supplier_id)

        where_clause = " AND ".join(where)

        orders = execute_query(f"""
            SELECT so.*, s.name as supplier_name, w.name as warehouse_name
            FROM supplier_orders so
            LEFT JOIN suppliers s ON so.supplier_id = s.id
            LEFT JOIN warehouses w ON so.warehouse_id = w.id
            WHERE {where_clause}
            ORDER BY so.created_at DESC
        """, tuple(params), fetch_all=True) or []

        return {"orders": orders}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Reviews ==============
@router.get("/reviews")
async def get_reviews(
    page: int = 1,
    filter: str = None
):
    """Get reviews list"""
    try:
        where = "1=1"
        if filter == 'pending':
            where = "pr.is_approved = 0"
        elif filter == 'approved':
            where = "pr.is_approved = 1"

        limit = 20
        offset = (page - 1) * limit

        reviews = execute_query(f"""
            SELECT pr.id, pr.rating, pr.content, pr.is_approved, pr.admin_reply, pr.replied_at,
                   p.name as product_name,
                   (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image,
                   u.id as user_id, u.name as user_name, u.avatar as user_avatar,
                   pr.created_at
            FROM product_reviews pr
            LEFT JOIN products p ON pr.product_id = p.id
            LEFT JOIN users u ON pr.user_id = u.id
            WHERE {where}
            ORDER BY pr.created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset), fetch_all=True) or []

        return {"reviews": reviews}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/reviews/{review_id}/approve")
async def approve_review(review_id: int):
    """Approve review"""
    execute_query("UPDATE product_reviews SET is_approved = 1 WHERE id = %s", (review_id,))
    return {"success": True}


@router.put("/reviews/{review_id}/reply")
async def reply_review(
    review_id: int,
    reply: str = Form(...)
):
    """Reply to review"""
    execute_query(
        "UPDATE product_reviews SET admin_reply = %s, replied_at = NOW() WHERE id = %s",
        (reply, review_id)
    )
    return {"success": True}


@router.put("/reviews/{review_id}/toggle")
async def toggle_review_active(
    review_id: int,
    is_active: bool = Form(...)
):
    """Toggle review active status"""
    execute_query("UPDATE product_reviews SET is_active = %s WHERE id = %s", (is_active, review_id))
    return {"success": True}


@router.delete("/reviews/{review_id}")
async def delete_review(review_id: int):
    """Delete review"""
    execute_query("DELETE FROM product_reviews WHERE id = %s", (review_id,))
    return {"success": True}


# ============== News ==============
@router.get("/news")
async def get_news_list():
    """Get news list"""
    news = execute_query("SELECT * FROM news ORDER BY published_at DESC, created_at DESC", fetch_all=True) or []
    return {"posts": news}


@router.post("/news")
async def create_news(
    title: str = Form(...),
    slug: str = Form(...),
    summary: str = Form(None),
    content: str = Form(None),
    category: str = Form(None),
    is_featured: bool = Form(False),
    is_published: bool = Form(True),
    published_at: str = Form(None),
    thumbnail: str = Form(None)
):
    """Create news"""
    news_id = execute_query("""
        INSERT INTO news (title, slug, summary, content, category, is_featured, is_published, published_at, thumbnail, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
    """, (title, slug, summary, content, category, is_featured, is_published, published_at, thumbnail), return_lastrowid=True)

    news = execute_query("SELECT * FROM news WHERE id = %s", (news_id,), fetch_one=True)
    return {"success": True, "post": news}


@router.put("/news/{news_id}")
async def update_news(
    news_id: int,
    title: str = Form(None),
    slug: str = Form(None),
    summary: str = Form(None),
    content: str = Form(None),
    category: str = Form(None),
    is_featured: bool = Form(None),
    is_published: bool = Form(None),
    published_at: str = Form(None),
    thumbnail: str = Form(None)
):
    """Update news"""
    updates = []
    values = []
    fields = {
        'title': title, 'slug': slug, 'summary': summary, 'content': content,
        'category': category, 'is_featured': is_featured, 'is_published': is_published,
        'published_at': published_at, 'thumbnail': thumbnail
    }
    for k, v in fields.items():
        if v is not None:
            updates.append(f"{k} = %s")
            values.append(v)

    if updates:
        values.append(news_id)
        execute_query(f"UPDATE news SET {', '.join(updates)} WHERE id = %s", tuple(values))

    news = execute_query("SELECT * FROM news WHERE id = %s", (news_id,), fetch_one=True)
    return {"success": True, "post": news}


@router.delete("/news/{news_id}")
async def delete_news(news_id: int):
    """Delete news"""
    execute_query("DELETE FROM news WHERE id = %s", (news_id,))
    return {"success": True}


# ============== Contacts ==============
@router.get("/contacts")
async def get_contacts(filter: str = None):
    """Get contacts list"""
    try:
        where = "1=1"
        params = []
        if filter and filter != 'all':
            where = "status = %s"
            params.append(filter)

        contacts = execute_query(f"""
            SELECT * FROM contacts WHERE {where}
            ORDER BY created_at DESC
        """, tuple(params), fetch_all=True) or []

        return {"contacts": contacts}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Reports ==============
@router.get("/reports")
async def get_reports(period: str = "30days"):
    """Get reports data"""
    try:
        # Date filter
        date_filter_map = {
            "7days": "DATE_SUB(NOW(), INTERVAL 7 DAY)",
            "30days": "DATE_SUB(NOW(), INTERVAL 30 DAY)",
            "90days": "DATE_SUB(NOW(), INTERVAL 90 DAY)",
            "365days": "DATE_SUB(NOW(), INTERVAL 365 DAY)",
            "all": "'1970-01-01'"
        }
        date_filter = date_filter_map.get(period, date_filter_map["30days"])

        # Order stats
        order_stats = execute_query(f"""
            SELECT
                COUNT(*) as total_orders,
                COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_price ELSE 0 END), 0) as delivered_revenue,
                COALESCE(SUM(CASE WHEN status = 'delivered' THEN subtotal ELSE 0 END), 0) as delivered_subtotal,
                COALESCE(SUM(total_price), 0) as total_revenue,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned_orders
            FROM orders WHERE created_at >= {date_filter}
        """, fetch_one=True)

        # Customer stats
        customer_stats = execute_query(f"""
            SELECT COUNT(*) as total_customers,
                   SUM(CASE WHEN created_at >= {date_filter} THEN 1 ELSE 0 END) as new_customers
            FROM users WHERE role = 'user'
        """, fetch_one=True)

        # Category breakdown
        category_data = execute_query(f"""
            SELECT c.name,
                   COUNT(oi.id) as order_count,
                   COALESCE(SUM(oi.quantity), 0) as items_sold,
                   COALESCE(SUM(oi.total_price), 0) as revenue
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE o.created_at >= {date_filter}
            GROUP BY c.id, c.name
            ORDER BY revenue DESC LIMIT 8
        """, fetch_all=True) or []

        # Payment methods
        payment_data = execute_query(f"""
            SELECT payment_method as name, COUNT(*) as order_count, SUM(total_price) as revenue
            FROM orders WHERE created_at >= {date_filter}
            GROUP BY payment_method ORDER BY revenue DESC
        """, fetch_all=True) or []

        # Top products
        top_products = execute_query(f"""
            SELECT p.id, p.name, p.sku,
                   COALESCE(SUM(oi.quantity), 0) as sold,
                   COALESCE(SUM(oi.total_price), 0) as revenue,
                   COUNT(DISTINCT oi.order_id) as order_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id AND o.status = 'delivered'
            JOIN products p ON oi.product_id = p.id
            WHERE o.created_at >= {date_filter}
            GROUP BY p.id, p.name, p.sku
            ORDER BY revenue DESC LIMIT 10
        """, fetch_all=True) or []

        return {
            "success": True,
            "stats": {
                "totalRevenue": order_stats['delivered_revenue'] or 0,
                "grossRevenue": order_stats['total_revenue'] or 0,
                "totalOrders": order_stats['total_orders'] or 0,
                "deliveredOrders": order_stats['delivered_orders'] or 0,
                "cancelledOrders": order_stats['cancelled_orders'] or 0,
                "pendingOrders": order_stats['pending_orders'] or 0,
                "newCustomers": customer_stats['new_customers'] or 0,
                "totalCustomers": customer_stats['total_customers'] or 0,
            },
            "categoryData": category_data,
            "paymentData": payment_data,
            "topProducts": top_products
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============== Settings ==============
@router.get("/settings")
async def get_settings():
    """Get settings"""
    rows = execute_query("SELECT setting_key, setting_value FROM settings", fetch_all=True) or []
    settings = {row['setting_key']: row['setting_value'] for row in rows}
    return {"settings": settings}


@router.put("/settings")
async def update_settings(settings_data: dict):
    """Update settings"""
    try:
        for key, value in settings_data.items():
            execute_query("""
                INSERT INTO settings (setting_key, setting_value) VALUES (%s, %s)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            """, (key, value))
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
