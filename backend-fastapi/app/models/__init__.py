# Models - Database table structures

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class User(BaseModel):
    id: int
    name: str
    email: str
    password: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    role: str = "user"
    gender: Optional[str] = None
    birth_date: Optional[datetime] = None
    member_level: str = "Bronze"
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Address(BaseModel):
    id: int
    user_id: int
    full_name: str
    phone: str
    address: str
    ward: Optional[str] = ""
    district: Optional[str] = ""
    city: str
    is_default: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Category(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: int = 0
    is_featured: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True


class Brand(BaseModel):
    id: int
    name: str
    slug: str
    logo: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True


class Product(BaseModel):
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    stock: int = 0
    low_stock_threshold: int = 5
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    gender: str = "unisex"
    age_group: str = "adult"
    material: Optional[str] = None
    pattern: Optional[str] = None
    season: Optional[str] = None
    total_sold: int = 0
    view_count: int = 0
    is_featured: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True


class ProductImage(BaseModel):
    id: int
    product_id: int
    url: str
    alt_text: Optional[str] = None
    sort_order: int = 0
    is_primary: bool = False
    is_thumbnail: bool = False

    class Config:
        from_attributes = True


class ProductVariant(BaseModel):
    id: int
    product_id: int
    size_id: Optional[int] = None
    color_id: Optional[int] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[float] = None
    stock: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True


class Size(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    group_name: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True


class Color(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    hex_code: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True


class Order(BaseModel):
    id: int
    order_number: str
    user_id: Optional[int] = None
    status: str = "pending"
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    shipping_city: Optional[str] = None
    shipping_district: Optional[str] = None
    shipping_ward: Optional[str] = None
    subtotal: float
    shipping_fee: float = 0
    discount_amount: float = 0
    total_price: float
    payment_method: str = "cod"
    payment_status: str = "unpaid"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderItem(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    product_name: str
    product_sku: Optional[str] = None
    product_image: Optional[str] = None
    size_name: Optional[str] = None
    color_name: Optional[str] = None
    variant_name: Optional[str] = None
    unit_price: float
    quantity: int
    total_price: float

    class Config:
        from_attributes = True


class Wishlist(BaseModel):
    id: int
    user_id: int
    product_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProductReview(BaseModel):
    id: int
    product_id: int
    user_id: int
    order_id: Optional[int] = None
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    is_verified_purchase: bool = False
    is_approved: bool = False
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Promotion(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    banner: Optional[str] = None
    promotion_type: str = "flash_sale"
    discount_type: str = "percentage"
    discount_value: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False

    class Config:
        from_attributes = True


class Coupon(BaseModel):
    id: int
    code: str
    name: Optional[str] = None
    description: Optional[str] = None
    coupon_type: str = "general"
    discount_type: str = "percentage"
    discount_value: float
    max_discount_amount: Optional[float] = None
    min_order_amount: float = 0
    max_usage_total: Optional[int] = None
    max_usage_per_user: int = 1
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True
    is_public: bool = True

    class Config:
        from_attributes = True


class Employee(BaseModel):
    id: int
    user_id: Optional[int] = None
    employee_code: str
    first_name: str
    last_name: str
    full_name: str
    email: str
    phone: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[datetime] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class Supplier(BaseModel):
    id: int
    name: str
    code: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class Warehouse(BaseModel):
    id: int
    name: str
    code: str
    address: str
    phone: Optional[str] = None
    is_main: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True


class News(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = True
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Contact(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    contact_type: str = "general"
    priority: str = "medium"
    status: str = "new"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
