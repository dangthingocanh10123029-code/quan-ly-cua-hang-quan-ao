# Utils - Helper functions

def normalize_search(text: str) -> str:
    """Normalize Vietnamese text for search"""
    if not text:
        return ""
    # Remove accents (simplified version)
    replacements = {
        'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
        'đ': 'd'
    }
    result = text.lower()
    for vietnamese, latin in replacements.items():
        result = result.replace(vietnamese, latin)
    return result


def enrich_product(product: dict) -> dict:
    """Add computed fields to product"""
    discount_percent = 0
    if product.get('sale_percent'):
        discount_percent = int(product.get('sale_percent'))
    elif product.get('compare_price') and product.get('price'):
        if product['compare_price'] > product['price']:
            discount_percent = round((1 - product['price'] / product['compare_price']) * 100)
    
    return {
        **product,
        'avg_rating': float(product.get('avg_rating') or 0),
        'review_count': int(product.get('review_count') or 0),
        'discount_percent': discount_percent,
        'image_url': product.get('image_url') or 'https://via.placeholder.com/400x533',
        'is_on_sale': discount_percent > 0,
        'is_out_of_stock': product.get('stock', 0) == 0
    }


def get_default_categories() -> list:
    """Default categories when database is empty"""
    return [
        {"id": 1, "name": "Áo thun", "slug": "ao-thun", "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"},
        {"id": 2, "name": "Phụ kiện", "slug": "phu-kien", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"},
        {"id": 3, "name": "Jean", "slug": "jean", "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"},
        {"id": 4, "name": "Giày", "slug": "giay", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"}
    ]


def get_default_brands() -> list:
    """Default brands when database is empty"""
    return [
        {"id": 1, "name": "NIKE", "slug": "nike"},
        {"id": 2, "name": "ADIDAS", "slug": "adidas"},
        {"id": 3, "name": "ZARA", "slug": "zara"},
        {"id": 4, "name": "H&M", "slug": "hm"},
        {"id": 5, "name": "UNIQLO", "slug": "uniqlo"}
    ]


def get_default_news() -> list:
    """Default news when database is empty"""
    return [
        {
            "id": 1,
            "title": "Tương lai của những đường may cắt bằng Laser",
            "slug": "tuong-lai-duong-may-cat-laser",
            "summary": "Khám phá cách tự động hóa robot đang định nghĩa lại độ chính xác của cấu trúc thời trang kiến trúc.",
            "thumbnail": "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600",
            "category": "Bền vững"
        },
        {
            "id": 2,
            "title": "Giao điểm: Công năng & Hình thái",
            "slug": "giao-diem-cong-nang-hinh-thai",
            "summary": "Nhà thiết kế chính của chúng tôi thảo luận về sự cân bằng giữa túi ưu tiên tiện dụng và kiểu dáng sàn diễn cao cấp.",
            "thumbnail": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600",
            "category": "Phòng thí nghiệm thiết kế"
        },
        {
            "id": 3,
            "title": "Tính linh động đô thị năm 2024",
            "slug": "tinh-linh-dong-do-thi-2024",
            "summary": "Tại sao trang phục kỹ thuật đang trở thành đồng phục hàng ngày cho những người du mục kỹ thuật số hiện đại.",
            "thumbnail": "https://images.unsplash.com/photo-1514580428313-1a8b7c43b55e?w=600",
            "category": "Văn hóa"
        }
    ]
