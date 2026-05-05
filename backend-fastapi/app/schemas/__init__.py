# Schemas - Request/Response models

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime


# ============== Common ==============
class ApiResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[dict]
    total: int
    page: int
    total_pages: int


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10


# ============== Auth ==============
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[dict] = None
    message: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    member_level: Optional[str] = "Bronze"


# ============== Profile ==============
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None


# ============== Address ==============
class AddressCreate(BaseModel):
    full_name: str
    phone: str
    address: str
    ward: Optional[str] = ""
    district: Optional[str] = ""
    city: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    ward: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    address: str
    ward: Optional[str]
    district: Optional[str]
    city: str
    is_default: int
    created_at: Optional[datetime]


# ============== Order ==============
class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    variant_id: Optional[int] = None
    product_name: str
    product_sku: Optional[str] = ""
    product_image: Optional[str] = ""
    size_name: Optional[str] = ""
    color_name: Optional[str] = ""
    variant_name: Optional[str] = ""
    unit_price: float
    quantity: int = 1


class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: str
    shipping_fee: float = 0
    discount_amount: float = 0
    payment_method: str = "cod"
    payment_status: str = "unpaid"
    note: str = ""
    coupon_code: Optional[str] = None
    recipient_name: str = ""
    recipient_phone: str = ""
    ward: str = ""
    district: str = ""
    city: str = ""


class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_price: float
    status: str
    payment_status: str
    payment_method: str
    created_at: Optional[datetime]


# ============== Wishlist ==============
class WishlistAdd(BaseModel):
    productId: int


class WishlistItem(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    image_url: Optional[str]


# ============== Review ==============
class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(..., ge=1, le=5)
    content: str = Field(..., min_length=10)


# ============== Product ==============
class ProductListItem(BaseModel):
    id: int
    name: str
    slug: str
    short_description: Optional[str]
    price: float
    compare_price: Optional[float]
    stock: int
    gender: Optional[str]
    age_group: Optional[str]
    is_featured: bool
    category_name: Optional[str]
    category_slug: Optional[str]
    brand_name: Optional[str]
    brand_slug: Optional[str]
    image_url: Optional[str]
    avg_rating: float = 0
    review_count: int = 0


class ProductDetail(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    short_description: Optional[str]
    price: float
    compare_price: Optional[float]
    stock: int
    category_name: Optional[str]
    category_slug: Optional[str]
    brand_name: Optional[str]
    brand_slug: Optional[str]
    images: List[dict] = []
    variants: List[dict] = []
    sizes: List[dict] = []
    colors: List[dict] = []
    reviews: List[dict] = []
    related_products: List[dict] = []
    avg_rating: float = 0
    review_count: int = 0
    discount_percent: int = 0


# ============== Category ==============
class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    image: Optional[str]
    description: Optional[str]
    icon: Optional[str]


# ============== Brand ==============
class BrandResponse(BaseModel):
    id: int
    name: str
    slug: str
    logo: Optional[str]
    description: Optional[str]


# ============== Admin - Product ==============
class ProductCreate(BaseModel):
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
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    gender: Optional[str] = "unisex"
    age_group: Optional[str] = "adult"
    material: Optional[str] = None
    pattern: Optional[str] = None
    season: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True
    images: List[str] = []


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    cost_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    brand_id: Optional[int] = None
    gender: Optional[str] = None
    age_group: Optional[str] = None
    material: Optional[str] = None
    pattern: Optional[str] = None
    season: Optional[str] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    images: Optional[List[str]] = None


# ============== Admin - Category ==============
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    sort_order: int = 0
    is_featured: bool = False
    is_active: bool = True


# ============== Admin - Brand ==============
class BrandCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    logo: Optional[str] = None
    website: Optional[str] = None
    country: Optional[str] = None
    is_featured: bool = False
    is_active: bool = True


# ============== Admin - Order ==============
class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None


class PaymentStatusUpdate(BaseModel):
    payment_status: str


class OrderCancel(BaseModel):
    reason: Optional[str] = None


# ============== Admin - Employee ==============
class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    id_card: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None
    commission_rate: Optional[float] = 0
    gender: Optional[str] = "male"


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    id_card: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    hire_date: Optional[str] = None
    salary: Optional[float] = None
    commission_rate: Optional[float] = None
    gender: Optional[str] = None


# ============== Admin - Promotion ==============
class PromotionCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    promotion_type: str = "flash_sale"
    discount_type: str = "percentage"
    discount_value: Optional[float] = None
    max_discount_amount: Optional[float] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False


# ============== Admin - Coupon ==============
class CouponCreate(BaseModel):
    code: str
    name: Optional[str] = None
    description: Optional[str] = None
    coupon_type: str = "general"
    discount_type: str = "percentage"
    discount_value: float
    max_discount_amount: Optional[float] = None
    min_order_amount: Optional[float] = 0
    max_usage_total: Optional[int] = None
    max_usage_per_user: int = 1
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_active: bool = True
    is_public: bool = True


# ============== Admin - Supplier ==============
class SupplierCreate(BaseModel):
    name: str
    code: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_code: Optional[str] = None
    contact_person: Optional[str] = None
    bank_account: Optional[str] = None
    bank_name: Optional[str] = None
    debt_limit: Optional[float] = 0


# ============== Admin - Warehouse ==============
class WarehouseCreate(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    phone: Optional[str] = None
    is_main: bool = False


# ============== Admin - News ==============
class NewsCreate(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    is_featured: bool = False
    is_published: bool = True
    published_at: Optional[str] = None
    thumbnail: Optional[str] = None


# ============== Settings ==============
class SettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    store_email: Optional[str] = None
    store_phone: Optional[str] = None
    store_address: Optional[str] = None
    # ... other settings as needed
