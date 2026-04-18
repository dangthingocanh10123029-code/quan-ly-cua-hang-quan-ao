import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productAPI } from '../services/api'
import { formatPrice } from '../utils/formatPrice'

// Star Rating Component
const StarRating = ({ rating = 0, maxRating = 5, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <div className={`flex text-amber-500 ${sizeClass}`}>
      {[...Array(maxRating)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined"
          style={{
            fontVariationSettings: i < Math.floor(rating) ? "'FILL' 1" : "'FILL' 0"
          }}
        >
          {i < Math.floor(rating) ? 'star' : 'star'}
        </span>
      ))}
    </div>
  )
}

// Breadcrumb Component
const Breadcrumb = ({ items }) => (
  <nav className="flex items-center gap-2 text-sm mb-8">
    <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">
      Trang chủ
    </Link>
    <span className="text-on-surface-variant">/</span>
    {items.map((item, index) => (
      <React.Fragment key={item.slug}>
        {index < items.length - 1 ? (
          <>
            <Link to={item.path} className="text-on-surface-variant hover:text-primary transition-colors">
              {item.name}
            </Link>
            <span className="text-on-surface-variant">/</span>
          </>
        ) : (
          <span className="text-on-surface font-medium">{item.name}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

// Size Selector Component
const SizeSelector = ({ sizes, selectedSize, onSelect, stockMap }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label-sm text-on-surface-variant uppercase tracking-wide">Kích thước</span>
        <button className="text-sm text-primary hover:underline">Hướng dẫn chọn size</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const sizeStock = stockMap?.[size.id] || 0
          const isAvailable = sizeStock > 0
          const isSelected = selectedSize?.id === size.id
          
          return (
            <button
              key={size.id}
              onClick={() => isAvailable && onSelect(size)}
              disabled={!isAvailable}
              className={`
                min-w-[48px] px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-white shadow-md' 
                  : isAvailable 
                    ? 'bg-surface-container-low hover:bg-surface-container text-on-surface' 
                    : 'bg-surface-container-low/50 text-on-surface-variant/40 cursor-not-allowed line-through'
                }
              `}
            >
              {size.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Color Selector Component
const ColorSelector = ({ colors, selectedColor, onSelect }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="label-sm text-on-surface-variant uppercase tracking-wide">Màu sắc</span>
        {selectedColor && <span className="text-sm text-on-surface">{selectedColor.name}</span>}
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor?.id === color.id
          return (
            <button
              key={color.id}
              onClick={() => onSelect(color)}
              className={`
                relative w-10 h-10 rounded-full transition-all duration-200
                ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'hover:scale-110'}
              `}
              style={{ backgroundColor: color.hex || '#ccc' }}
              title={color.name}
            >
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-white drop-shadow-md">
                    check
                  </span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Product Gallery Component
const ProductGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[4/5] bg-surface-container-low rounded-xl overflow-hidden">
        <img
          src={images[selectedIndex]?.url || 'https://via.placeholder.com/600x750'}
          alt={productName}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className={`
                flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200
                ${selectedIndex === index 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'opacity-60 hover:opacity-100'
                }
              `}
            >
              <img
                src={img.url}
                alt={img.alt_text || `${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Review Card Component
const ReviewCard = ({ review }) => {
  const date = new Date(review.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-surface-container-low rounded-xl p-6">
      <div className="flex items-start gap-4">
        <img
          src={review.user_avatar}
          alt={review.user_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-on-surface">{review.user_name}</span>
            <span className="text-xs text-on-surface-variant">{date}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={review.rating} size="sm" />
            {review.is_verified_purchase && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">verified</span>
                Đã mua hàng
              </span>
            )}
          </div>
          {review.title && (
            <h4 className="font-medium text-on-surface mb-2">{review.title}</h4>
          )}
          <p className="text-on-surface-variant text-sm leading-relaxed">
            {review.content}
          </p>
          {review.admin_reply && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-primary/20">
              <p className="text-sm text-primary font-medium mb-1">Phản hồi từ cửa hàng:</p>
              <p className="text-sm text-on-surface-variant">{review.admin_reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main ProductDetailPage Component
const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [cartCount] = useState(3)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productAPI.getProduct(slug)
      
      if (response.success) {
        setProduct(response.data)
        // Set default color if available
        if (response.data.colors?.length > 0) {
          setSelectedColor(response.data.colors[0])
        }
        // Set default size if available
        if (response.data.sizes?.length > 0) {
          setSelectedSize(response.data.sizes[0])
        }
      } else {
        setError(response.message)
      }
    } catch (err) {
      console.error('Error fetching product:', err)
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    alert(`Đã thêm vào giỏ hàng:\n- Sản phẩm: ${product?.name}\n- Số lượng: ${quantity}\n- Size: ${selectedSize?.name}\n- Màu: ${selectedColor?.name}`)
  }

  const handleBuyNow = () => {
    // TODO: Implement buy now functionality
    alert(`Mua ngay:\n- Sản phẩm: ${product?.name}\n- Số lượng: ${quantity}\n- Size: ${selectedSize?.name}\n- Màu: ${selectedColor?.name}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header cartCount={cartCount} />
        <main className="pt-20">
          <div className="max-w-screen-2xl mx-auto px-8 py-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-[4/5] bg-surface-container-low rounded-xl skeleton" />
                <div className="flex gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-surface-container-low rounded-lg skeleton" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 w-3/4 bg-surface-container-low rounded skeleton" />
                <div className="h-6 w-1/4 bg-surface-container-low rounded skeleton" />
                <div className="h-12 w-1/2 bg-surface-container-low rounded skeleton" />
                <div className="h-24 bg-surface-container-low rounded skeleton" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface">
        <Header cartCount={cartCount} />
        <main className="pt-20">
          <div className="max-w-screen-2xl mx-auto px-8 py-20 text-center">
            <span className="material-symbols-outlined text-8xl text-on-surface-variant mb-6">
              error_outline
            </span>
            <h1 className="text-2xl font-bold text-on-surface mb-4">
              {error || 'Sản phẩm không tồn tại'}
            </h1>
            <p className="text-on-surface-variant mb-8">
              Có thể sản phẩm đã hết hàng hoặc không còn được bán.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-white px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Quay về trang chủ
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const discountPercent = product.discount_percent || 0

  // Build stock map for sizes
  const sizeStockMap = product.variants?.reduce((acc, v) => {
    if (v.size_id) {
      acc[v.size_id] = (acc[v.size_id] || 0) + v.stock
    }
    return acc
  }, {}) || {}

  return (
    <div className="min-h-screen bg-surface">
      <Header cartCount={cartCount} />

      <main className="pt-20">
        <div className="max-w-screen-2xl mx-auto px-8 py-12">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: product.category_name || 'Sản phẩm', path: `/category/${product.category_slug}` },
              { name: product.name, slug: product.slug }
            ]}
          />

          {/* Product Layout */}
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Left: Product Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {/* Brand */}
              {product.brand_name && (
                <Link 
                  to={`/brand/${product.brand_slug}`}
                  className="label-sm text-primary uppercase tracking-wider mb-3 hover:underline inline-block"
                >
                  {product.brand_name}
                </Link>
              )}

              {/* Title */}
              <h1 className="headline-font text-3xl lg:text-4xl font-bold text-on-surface tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <StarRating rating={product.avg_rating || 0} />
                  <span className="font-medium text-on-surface">
                    {product.avg_rating ? product.avg_rating.toFixed(1) : '0'}
                  </span>
                </div>
                <span className="text-on-surface-variant">|</span>
                <Link to="#reviews" className="text-on-surface-variant hover:text-primary transition-colors">
                  {product.review_count || 0} đánh giá
                </Link>
                <span className="text-on-surface-variant">|</span>
                <span className="text-on-surface-variant">
                  {product.total_sold || 0} đã bán
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="headline-font text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price > product.price && (
                  <>
                    <span className="text-xl text-on-surface-variant line-through">
                      {formatPrice(product.compare_price)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-on-surface-variant leading-relaxed mb-8">
                  {product.short_description}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-outline-variant/30 mb-8" />

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <ColorSelector
                    colors={product.colors}
                    selectedColor={selectedColor}
                    onSelect={setSelectedColor}
                  />
                </div>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <SizeSelector
                    sizes={product.sizes}
                    selectedSize={selectedSize}
                    onSelect={setSelectedSize}
                    stockMap={sizeStockMap}
                  />
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 mt-auto">
                {/* Stock Info */}
                <div className="flex items-center gap-2 text-sm">
                  {isOutOfStock ? (
                    <span className="text-error font-medium">Hết hàng</span>
                  ) : product.stock <= 10 ? (
                    <span className="text-orange-600 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">inventory_2</span>
                      Chỉ còn {product.stock} sản phẩm
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Còn hàng
                    </span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="label-sm text-on-surface-variant uppercase tracking-wide">Số lượng</span>
                  <div className="flex items-center bg-surface-container-low rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <span className="w-12 text-center font-medium text-on-surface">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-4 rounded-md font-medium transition-all duration-200
                      ${isOutOfStock
                        ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
                        : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-4 rounded-md font-medium transition-all duration-200
                      ${isOutOfStock
                        ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
                        : 'bg-gradient-to-br from-primary to-primary-fixed-dim text-white hover:opacity-90'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined">flash_on</span>
                    Mua ngay
                  </button>
                </div>

                {/* Wishlist & Share */}
                <div className="flex items-center gap-4 pt-4">
                  <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">favorite_border</span>
                    <span className="text-sm">Thêm vào wishlist</span>
                  </button>
                  <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">share</span>
                    <span className="text-sm">Chia sẻ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-20 pt-12" id="reviews">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b border-outline-variant/30 mb-8">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    pb-4 text-sm font-medium uppercase tracking-wide transition-colors relative
                    ${activeTab === tab
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                    }
                  `}
                >
                  {tab === 'description' && 'Mô tả'}
                  {tab === 'details' && 'Chi tiết'}
                  {tab === 'reviews' && `Đánh giá (${product.review_count || 0})`}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-surface-container-low rounded-xl p-8 lg:p-12">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-on-surface leading-relaxed whitespace-pre-line">
                    {product.description || product.short_description || 'Không có mô tả.'}
                  </p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="label-sm text-on-surface-variant uppercase tracking-wide mb-4">
                      Thông tin sản phẩm
                    </h3>
                    <div className="space-y-3">
                      {product.material && (
                        <div className="flex justify-between py-2 border-b border-outline-variant/20">
                          <span className="text-on-surface-variant">Chất liệu</span>
                          <span className="text-on-surface font-medium">{product.material}</span>
                        </div>
                      )}
                      {product.pattern && (
                        <div className="flex justify-between py-2 border-b border-outline-variant/20">
                          <span className="text-on-surface-variant">Họa tiết</span>
                          <span className="text-on-surface font-medium">{product.pattern}</span>
                        </div>
                      )}
                      {product.season && (
                        <div className="flex justify-between py-2 border-b border-outline-variant/20">
                          <span className="text-on-surface-variant">Mùa</span>
                          <span className="text-on-surface font-medium">{product.season}</span>
                        </div>
                      )}
                      {product.origin && (
                        <div className="flex justify-between py-2 border-b border-outline-variant/20">
                          <span className="text-on-surface-variant">Xuất xứ</span>
                          <span className="text-on-surface font-medium">{product.origin}</span>
                        </div>
                      )}
                      {product.sku && (
                        <div className="flex justify-between py-2 border-b border-outline-variant/20">
                          <span className="text-on-surface-variant">SKU</span>
                          <span className="text-on-surface font-medium font-mono text-sm">{product.sku}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="label-sm text-on-surface-variant uppercase tracking-wide mb-4">
                      Chính sách
                    </h3>
                    <div className="bg-surface-container rounded-lg p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                        <div>
                          <p className="font-medium text-on-surface">Miễn phí vận chuyển</p>
                          <p className="text-sm text-on-surface-variant">Cho đơn hàng từ 300.000đ</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">autorenew</span>
                        <div>
                          <p className="font-medium text-on-surface">Đổi trả trong 30 ngày</p>
                          <p className="text-sm text-on-surface-variant">Áp dụng với sản phẩm chưa qua sử dụng</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">verified</span>
                        <div>
                          <p className="font-medium text-on-surface">Bảo hành chính hãng</p>
                          <p className="text-sm text-on-surface-variant">Cam kết 100% authentic</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8">
                  {product.reviews?.length > 0 ? (
                    <>
                      {/* Reviews Summary */}
                      <div className="grid md:grid-cols-3 gap-8 p-6 bg-surface-container rounded-xl mb-8">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-primary mb-2">
                            {product.avg_rating?.toFixed(1) || '0'}
                          </div>
                          <StarRating rating={product.avg_rating || 0} />
                          <p className="text-sm text-on-surface-variant mt-2">
                            {product.review_count || 0} đánh giá
                          </p>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = product.reviews?.filter(r => r.rating === star).length || 0
                            const percent = product.reviews?.length > 0 
                              ? (count / product.reviews.length) * 100 
                              : 0
                            return (
                              <div key={star} className="flex items-center gap-2">
                                <span className="text-sm text-on-surface-variant w-8">{star}</span>
                                <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                                <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <span className="text-sm text-on-surface-variant w-8">{count}</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-4">
                        {product.reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">
                        rate_review
                      </span>
                      <h3 className="text-xl font-medium text-on-surface mb-2">
                        Chưa có đánh giá nào
                      </h3>
                      <p className="text-on-surface-variant">
                        Hãy là người đầu tiên đánh giá sản phẩm này!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {product.related_products?.length > 0 && (
            <div className="mt-20 pt-12">
              <h2 className="headline-font text-2xl font-bold text-on-surface mb-8">
                Sản phẩm liên quan
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {product.related_products.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
