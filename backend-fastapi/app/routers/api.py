# Public API routes - Home, Products, News

from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ..database import execute_query
from ..utils import enrich_product, get_default_categories, get_default_brands, get_default_news

router = APIRouter(prefix="/api", tags=["Public"])


@router.get("/")
async def root():
    """Health check"""
    return {"status": "OK", "message": "CLOTH Store API"}


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK", "timestamp": "2026-05-05T00:00:00Z"}


@router.get("/home")
async def get_home_data():
    """Get all homepage data"""
    try:
        # 1. Banners from promotions
        banners = execute_query("""
            SELECT 
                p.id, p.name, p.description, p.banner as image,
                p.banner_url as link_url, p.slug, p.discount_type,
                p.discount_value, p.valid_from, p.valid_until, p.promotion_type
            FROM promotions p
            WHERE p.is_active = TRUE
                AND p.banner IS NOT NULL AND p.banner != ''
                AND (p.valid_until IS NULL OR p.valid_until > NOW())
            ORDER BY p.priority DESC, p.created_at DESC
            LIMIT 5
        """, fetch_all=True) or []

        # 2. Featured categories
        categories = execute_query("""
            SELECT id, name, slug, image, description, icon
            FROM categories
            WHERE is_active = TRUE AND is_featured = TRUE
            ORDER BY sort_order ASC
            LIMIT 4
        """, fetch_all=True) or []

        # 3. Featured products
        featured_products = execute_query("""
            SELECT 
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.total_sold, p.gender, p.is_featured, p.material, p.season,
                c.name as category_name, c.slug as category_slug,
                b.name as brand_name, b.slug as brand_slug,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE AND p.is_featured = TRUE
            ORDER BY p.created_at DESC
            LIMIT 8
        """, fetch_all=True) or []

        # 4. Best sellers
        best_sellers = execute_query("""
            SELECT 
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.total_sold, p.gender,
                c.name as category_name, b.name as brand_name,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE AND p.total_sold > 0
            ORDER BY p.total_sold DESC
            LIMIT 8
        """, fetch_all=True) or []

        # 5. Flash sale products
        flash_sales = execute_query("""
            SELECT DISTINCT
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.total_sold, p.gender,
                c.name as category_name, b.name as brand_name,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count,
                pr.discount_value as sale_percent, pr.valid_until as sale_end_time
            FROM products p
            INNER JOIN promotions pr ON (
                JSON_CONTAINS(COALESCE(pr.applicable_products, '[]'), CAST(p.id AS CHAR))
                OR JSON_CONTAINS(COALESCE(pr.applicable_categories, '[]'), CAST(p.category_id AS CHAR))
            )
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE
                AND pr.is_active = TRUE
                AND pr.promotion_type = 'flash_sale'
                AND pr.valid_from <= NOW()
                AND (pr.valid_until IS NULL OR pr.valid_until > NOW())
            ORDER BY p.total_sold DESC
            LIMIT 10
        """, fetch_all=True) or []

        # 5b. Sale products (compare_price > price)
        sale_products = execute_query("""
            SELECT 
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.total_sold, p.gender,
                c.name as category_name, b.name as brand_name,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE
                AND p.compare_price IS NOT NULL AND p.compare_price > p.price
            ORDER BY (p.compare_price - p.price) DESC
            LIMIT 8
        """, fetch_all=True) or []

        # 6. Featured brands
        brands = execute_query("""
            SELECT id, name, slug, logo, description, country, website
            FROM brands
            WHERE is_active = TRUE AND is_featured = TRUE
            ORDER BY name ASC
            LIMIT 8
        """, fetch_all=True) or []

        # 7. Reviews
        reviews = execute_query("""
            SELECT 
                pr.id, pr.product_id, pr.rating, pr.title, pr.content,
                pr.created_at, pr.is_verified_purchase,
                p.name as product_name, p.slug as product_slug,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image,
                u.name as user_name, u.avatar as user_avatar
            FROM product_reviews pr
            INNER JOIN products p ON pr.product_id = p.id
            INNER JOIN users u ON pr.user_id = u.id
            WHERE pr.is_approved = TRUE
            ORDER BY pr.created_at DESC
            LIMIT 6
        """, fetch_all=True) or []

        # 8. News
        news = execute_query("""
            SELECT id, title, slug, summary, thumbnail, category, tags, view_count, author_name, published_at
            FROM news
            WHERE is_published = TRUE
                AND published_at IS NOT NULL
                AND published_at <= NOW()
            ORDER BY published_at DESC
            LIMIT 3
        """, fetch_all=True) or []

        # Calculate flash sale timer
        flash_sale_timer = {"hours": 0, "minutes": 0, "seconds": 0}
        if flash_sales and flash_sales[0].get('sale_end_time'):
            from datetime import datetime
            end_time = flash_sales[0]['sale_end_time']
            now = datetime.now()
            diff = (end_time - now).total_seconds() if end_time > now else 0
            if diff > 0:
                flash_sale_timer = {
                    "hours": int(diff // 3600),
                    "minutes": int((diff % 3600) // 60),
                    "seconds": int(diff % 60)
                }

        return {
            "success": True,
            "data": {
                "banners": [
                    {**b, "image": b.get("image") or "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920"}
                    for b in banners
                ],
                "categories": categories if categories else get_default_categories(),
                "featuredProducts": [enrich_product(p) for p in featured_products],
                "bestSellers": [enrich_product(p) for p in best_sellers],
                "flashSales": {
                    "products": [enrich_product(p) for p in flash_sales],
                    "timer": flash_sale_timer
                },
                "saleProducts": [enrich_product(p) for p in sale_products],
                "brands": brands if brands else get_default_brands(),
                "reviews": reviews,
                "news": news if news else get_default_news()
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    gender: Optional[str] = None,
    age_group: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: str = "created_at",
    order: str = "desc",
    page: int = 1,
    limit: int = 12
):
    """Get products with filters"""
    try:
        where_clauses = ["p.is_active = TRUE"]
        params = []

        if category:
            where_clauses.append("c.slug = %s")
            params.append(category)
        if brand:
            where_clauses.append("b.slug = %s")
            params.append(brand)
        if gender:
            where_clauses.append("p.gender = %s")
            params.append(gender)
        if age_group:
            where_clauses.append("p.age_group = %s")
            params.append(age_group)
        if min_price:
            where_clauses.append("p.price >= %s")
            params.append(min_price)
        if max_price:
            where_clauses.append("p.price <= %s")
            params.append(max_price)

        where_clause = " AND ".join(where_clauses)

        # Validate sort
        allowed_sorts = ['created_at', 'price', 'name', 'total_sold', 'view_count']
        sort_column = sort if sort in allowed_sorts else 'created_at'
        sort_order = "ASC" if order.lower() == "asc" else "DESC"

        offset = (page - 1) * limit

        # Count total
        count_result = execute_query(
            f"SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN brands b ON p.brand_id = b.id WHERE {where_clause}",
            tuple(params),
            fetch_one=True
        )
        total = count_result['total'] if count_result else 0

        # Get products
        products = execute_query(f"""
            SELECT 
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.gender, p.age_group, p.is_featured,
                c.name as category_name, c.slug as category_slug,
                b.name as brand_name, b.slug as brand_slug,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE {where_clause}
            ORDER BY p.{sort_column} {sort_order}
            LIMIT %s OFFSET %s
        """, tuple(params + [limit, offset]), fetch_all=True) or []

        return {
            "success": True,
            "data": {
                "products": [enrich_product(p) for p in products],
                "pagination": {
                    "page": page,
                    "limit": limit,
                    "total": total,
                    "total_pages": (total + limit - 1) // limit
                }
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/search")
async def search_products(q: str = Query(..., min_length=2)):
    """Search products"""
    try:
        search_term = f"%{q.strip()}%"

        products = execute_query("""
            SELECT 
                p.id, p.name, p.slug, p.short_description, p.price, p.compare_price,
                p.stock, p.gender,
                c.name as category_name, c.slug as category_slug,
                b.name as brand_name,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.is_active = TRUE
                AND (p.name LIKE %s OR p.short_description LIKE %s OR p.description LIKE %s OR b.name LIKE %s)
            ORDER BY p.is_featured DESC, p.view_count DESC
            LIMIT 20
        """, (search_term, search_term, search_term, search_term), fetch_all=True) or []

        return {
            "success": True,
            "data": {
                "products": [enrich_product(p) for p in products],
                "total": len(products)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/kids-categories")
async def get_kids_categories():
    """Get kids product categories with counts"""
    try:
        categories = execute_query("""
            SELECT c.slug, c.name, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id AND p.age_group = 'kids' AND p.is_active = TRUE
            WHERE c.slug IN ('ao-tre-em', 'quan-tre-em', 'vay-tre-em', 'dam-tre-em', 'bo-do-tre-em')
            GROUP BY c.slug, c.name
        """, fetch_all=True) or []

        total_result = execute_query(
            "SELECT COUNT(*) as total FROM products WHERE age_group = 'kids' AND is_active = TRUE",
            fetch_one=True
        )
        total = total_result['total'] if total_result else 0

        categories_with_all = [
            {"id": "all", "name": "Tất cả", "count": total},
            *[{
                "id": c['slug'],
                "name": c['name'],
                "count": c['product_count']
            } for c in categories]
        ]

        return {
            "success": True,
            "data": categories_with_all
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/products/{slug}")
async def get_product_by_slug(slug: str):
    """Get product detail by slug"""
    try:
        # Get product
        product = execute_query("""
            SELECT 
                p.*,
                c.name as category_name, c.slug as category_slug,
                b.name as brand_name, b.slug as brand_slug, b.logo as brand_logo,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.slug = %s AND p.is_active = TRUE
        """, (slug,), fetch_one=True)

        if not product:
            raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại")

        # Increase view count
        execute_query("UPDATE products SET view_count = view_count + 1 WHERE id = %s", (product['id'],))

        # Get images
        images = execute_query("""
            SELECT id, url, alt_text, sort_order, is_primary
            FROM product_images
            WHERE product_id = %s
            ORDER BY sort_order ASC, is_primary DESC
        """, (product['id'],), fetch_all=True) or []

        # Get variants
        variants = execute_query("""
            SELECT 
                pv.*, s.name as size_name, s.code as size_code,
                c.name as color_name, c.code as color_code, c.hex_code
            FROM product_variants pv
            LEFT JOIN sizes s ON pv.size_id = s.id
            LEFT JOIN colors c ON pv.color_id = c.id
            WHERE pv.product_id = %s AND pv.is_active = TRUE
            ORDER BY s.sort_order ASC, c.sort_order ASC
        """, (product['id'],), fetch_all=True) or []

        # Group sizes and colors
        sizes = list({v['size_id']: {"id": v['size_id'], "name": v['size_name'], "code": v['size_code']} 
                      for v in variants if v['size_id']}.values())
        colors = list({v['color_id']: {"id": v['color_id'], "name": v['color_name'], "code": v['color_code'], "hex": v['hex_code']} 
                      for v in variants if v['color_id']}.values())

        # Get reviews
        reviews = execute_query("""
            SELECT pr.*, u.name as user_name, u.avatar as user_avatar
            FROM product_reviews pr
            INNER JOIN users u ON pr.user_id = u.id
            WHERE pr.product_id = %s AND pr.is_approved = TRUE AND pr.is_active = TRUE
            ORDER BY pr.created_at DESC
            LIMIT 10
        """, (product['id'],), fetch_all=True) or []

        reviews = [{
            **r,
            "user_avatar": r['user_avatar'] or f"https://ui-avatars.com/api/?name={r['user_name']}&background=4450b7&color=fff"
        } for r in reviews]

        # Get related products
        related = execute_query("""
            SELECT 
                p.id, p.name, p.slug, p.price, p.compare_price, p.stock,
                c.name as category_name,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as avg_rating,
                (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id AND is_approved = TRUE AND is_active = TRUE) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.category_id = %s AND p.id != %s AND p.is_active = TRUE
            ORDER BY p.is_featured DESC, p.created_at DESC
            LIMIT 4
        """, (product['category_id'], product['id']), fetch_all=True) or []

        # Calculate discount
        discount_percent = 0
        if product['compare_price'] and product['compare_price'] > product['price']:
            discount_percent = round((1 - product['price'] / product['compare_price']) * 100)

        return {
            "success": True,
            "data": {
                **product,
                "avg_rating": float(product.get('avg_rating') or 0),
                "review_count": int(product.get('review_count') or 0),
                "images": images,
                "variants": variants,
                "sizes": sizes,
                "colors": colors,
                "discount_percent": discount_percent,
                "reviews": reviews,
                "related_products": [enrich_product(p) for p in related]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news")
async def get_news(category: Optional[str] = None, limit: int = 20):
    """Get news list"""
    try:
        params = []
        where = "is_published = TRUE AND published_at IS NOT NULL AND published_at <= NOW()"
        
        if category:
            where += " AND category = %s"
            params.append(category)
        
        news = execute_query(f"""
            SELECT id, title, slug, summary, thumbnail, category, tags, view_count, author_name, published_at
            FROM news
            WHERE {where}
            ORDER BY published_at DESC
            LIMIT %s
        """, tuple(params + [limit]), fetch_all=True) or []

        return {"success": True, "news": news}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/news/{slug}")
async def get_news_by_slug(slug: str):
    """Get news article by slug"""
    try:
        article = execute_query(
            "SELECT * FROM news WHERE slug = %s AND is_published = TRUE AND published_at <= NOW()",
            (slug,), fetch_one=True
        )

        if not article:
            raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")

        # Increase view count
        execute_query("UPDATE news SET view_count = view_count + 1 WHERE id = %s", (article['id'],))

        return {"success": True, "article": article}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
