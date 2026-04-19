import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { productAPI, customerAPI } from '../services/api'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'

// Star Rating Component
const StarRating = ({ rating = 0, maxRating = 5, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <div className={`flex text-tertiary ${sizeClass}`}>
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
  <nav className="flex items-center gap-2 text-on-surface-variant font-label text-xs uppercase tracking-widest mb-8">
    <Link to="/" className="hover:text-primary transition-colors">
      Trang chủ
    </Link>
    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
    {items.map((item, index) => (
      <React.Fragment key={item.slug}>
        {index < items.length - 1 ? (
          <>
            <Link to={item.path} className="hover:text-primary transition-colors">
              {item.name}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </>
        ) : (
          <span className="text-on-surface font-semibold">{item.name}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
)

// Review Card Component
const ReviewCard = ({ review }) => {
  const date = new Date(review.created_at).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <article className="pb-12 border-b border-outline-variant/30 last:border-0 last:pb-0">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-headline font-bold text-on-surface">{review.user_name}</h4>
          <div className="flex items-center gap-1 text-tertiary text-xs mt-1">
            <StarRating rating={review.rating} size="sm" />
          </div>
        </div>
        <time className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
          {date}
        </time>
      </div>
      <p className="text-on-surface-variant text-sm leading-relaxed font-body">
        {review.content}
      </p>
    </article>
  )
}

// Interactive Star Rating (for form)
const InteractiveStarRating = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => onChange(star)}
        className="transition-transform hover:scale-110 focus:outline-none"
      >
        <span
          className="material-symbols-outlined text-3xl"
          style={{
            color: star <= value ? '#f59e0b' : '#d1d5db',
            fontVariationSettings: `'FILL' ${star <= value ? 1 : 0}`
          }}
        >
          star
        </span>
      </button>
    ))}
  </div>
)

// Review Form Component
const ReviewForm = ({ productId, onSuccess }) => {
  const { isAuthenticated } = useAuth()
  const globalToast = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="bg-surface-container-low rounded-2xl p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-3">account_circle</span>
        <p className="text-on-surface-variant mb-3">Vui lòng đăng nhập để viết đánh giá</p>
        <Link
          to="/login"
          className="inline-block px-6 py-2 bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      globalToast.warning('Vui lòng chọn số sao đánh giá')
      return
    }
    if (content.trim().length < 10) {
      globalToast.warning('Nội dung đánh giá phải có ít nhất 10 ký tự')
      return
    }
    setSubmitting(true)
    try {
      const res = await customerAPI.createReview({ product_id: productId, rating, content: content.trim() })
      setRating(0)
      setContent('')
      globalToast.success(res.message || 'Cảm ơn bạn! Đánh giá đã được gửi.')
      if (onSuccess) onSuccess()
      const el = document.getElementById('reviews-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
      globalToast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-8">
      <h3 className="text-xl font-headline font-bold text-on-surface mb-6">Viết đánh giá của bạn</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            Đánh giá của bạn
          </label>
          <InteractiveStarRating
            value={hoverRating || rating}
            onChange={(r) => { setRating(r); setHoverRating(0) }}
          />
          {hoverRating > 0 && (
            <p className="text-sm text-on-surface-variant mt-1">
              {['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][hoverRating - 1]}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            Nội dung đánh giá
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 bg-surface text-on-surface rounded-lg border border-outline-variant focus:border-primary focus:outline-none resize-none text-sm placeholder:text-on-surface-variant/50"
          />
          <p className="text-xs text-on-surface-variant mt-1 text-right">{content.length}/500</p>
        </div>

        <button
          type="submit"
          disabled={submitting || rating === 0 || content.trim().length < 10}
          className="px-8 py-3 bg-primary text-on-primary font-label text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  )
}

// Main ProductDetailPage Component
const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, getItemCount } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const globalToast = useToast()

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState('description')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [slug, reviewSubmitted])

  useEffect(() => {
    setCartCount(getItemCount())
  }, [getItemCount])
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const showToast = (message, type = 'success') => {
    globalToast.success(message)
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productAPI.getProduct(slug)

      if (response.success) {
        setProduct(response.data)
        if (response.data.colors?.length > 0) {
          setSelectedColor(response.data.colors[0])
        }
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

  const handleAddToCart = async () => {
    if (isAddingToCart) return

    if (product.sizes?.length > 0 && !selectedSize) {
      showToast('Vui lòng chọn kích thước', 'error')
      return
    }
    if (product.colors?.length > 0 && !selectedColor) {
      showToast('Vui lòng chọn màu sắc', 'error')
      return
    }

    setIsAddingToCart(true)
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_price: product.compare_price,
        image_url: product.images?.[0]?.url || product.image_url
      }
      addItem(cartProduct, 1, selectedSize?.name || null, selectedColor?.name || null)
      setCartCount(getItemCount())
      showToast(`Đã thêm "${product.name}" vào giỏ hàng!`)
    } catch (err) {
      showToast('Không thể thêm vào giỏ hàng', 'error')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header cartCount={cartCount} />
        <main className="pt-20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-7 grid grid-cols-12 gap-4">
                <div className="col-span-2 space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[3/4] bg-surface-container-low skeleton" />
                  ))}
                </div>
                <div className="col-span-10 aspect-[3/4] bg-surface-container-low skeleton" />
              </div>
              <div className="lg:col-span-5 space-y-6">
                <div className="h-6 w-32 bg-surface-container-low skeleton" />
                <div className="h-12 w-3/4 bg-surface-container-low skeleton" />
                <div className="h-8 w-1/3 bg-surface-container-low skeleton" />
                <div className="h-24 bg-surface-container-low skeleton" />
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
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20 text-center">
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

  // Build color stock map
  const colorStockMap = product.variants?.reduce((acc, v) => {
    if (v.color_id) {
      acc[v.color_id] = (acc[v.color_id] || 0) + v.stock
    }
    return acc
  }, {}) || {}

  // Compute selected variant stock
  const selectedVariantStock = product.variants?.find(v =>
    (!selectedSize || v.size_id === selectedSize.id) &&
    (!selectedColor || v.color_id === selectedColor.id)
  )?.stock ?? product.stock

  return (
    <div className="min-h-screen bg-surface">
      <Header cartCount={cartCount} />

      <main className="pt-20">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12">

          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { name: product.category_name || 'Sản phẩm', path: `/category/${product.category_slug}` },
              { name: product.name, slug: product.slug }
            ]}
          />

          {/* Product Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-5 grid grid-cols-12 gap-3">
              {/* Thumbnails - vertical on left */}
              <div className="col-span-3 flex flex-col gap-3">
                {product.images?.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`
                      aspect-[3/4] overflow-hidden transition-all cursor-pointer
                      ${selectedImage === index
                        ? 'ring-1 ring-primary'
                        : 'hover:ring-1 hover:ring-outline-variant'
                      }
                    `}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="col-span-9 bg-surface-container-low aspect-[3/4] overflow-hidden">
                <img
                  src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/800x1067'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Product Info - Sticky */}
            <div className="lg:col-span-5 sticky top-32">

              {/* Category Tag & Rating */}
              <div className="mb-2 flex items-center justify-between">
                <span className="text-primary font-label text-xs font-semibold uppercase tracking-[0.2em]">
                  {product.category_name || 'Sản phẩm'}
                </span>
                <div className="flex items-center gap-1 text-tertiary">
                  <StarRating rating={product.avg_rating || 0} size="sm" />
                  <span className="text-on-surface-variant font-label text-xs ml-1">
                    ({product.review_count || 0} đánh giá)
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-headline font-bold text-on-surface mb-4 tracking-tighter leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-8">
                <span className="text-2xl font-headline font-medium text-primary tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price > product.price && (
                  <span className="text-base text-on-surface-variant line-through ml-3">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8 font-body">
                  {product.short_description}
                </p>
              )}

              {/* Color Selector */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label text-sm text-on-surface font-semibold uppercase">
                      Màu sắc: {selectedColor?.name || 'Chọn màu'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor?.id === color.id
                      const hasStock = (colorStockMap[color.id] || 0) > 0
                      return (
                        <button
                          key={color.id}
                          onClick={() => hasStock && setSelectedColor(color)}
                          disabled={!hasStock}
                          className={`
                            w-10 h-10 transition-all
                            ${isSelected
                              ? 'ring-2 ring-primary ring-offset-2'
                              : 'hover:ring-1 hover:ring-outline-variant'
                            }
                            ${!hasStock ? 'opacity-30 cursor-not-allowed' : ''}
                          `}
                          style={{ backgroundColor: color.hex || '#ccc' }}
                          title={color.name}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-label text-sm text-on-surface font-semibold uppercase">
                      Kích thước
                    </span>
                    <button className="text-primary text-xs font-medium underline uppercase tracking-wider hover:opacity-80">
                      Bảng size chuẩn
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => {
                      const sizeStock = sizeStockMap?.[size.id] || 0
                      const isAvailable = sizeStock > 0
                      const isSelected = selectedSize?.id === size.id

                      return (
                        <button
                          key={size.id}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          disabled={!isAvailable}
                          className={`
                            py-3 font-label text-sm font-medium transition-colors
                            ${isSelected
                              ? 'bg-primary text-on-primary'
                              : isAvailable
                                ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                                : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          {size.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Button - Full width gradient */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || selectedVariantStock === 0 || isAddingToCart}
                className={`
                  w-full py-5 font-headline font-bold text-base tracking-widest uppercase
                  transition-all active:scale-[0.98] mb-12 flex items-center justify-center gap-3
                  ${isOutOfStock || selectedVariantStock === 0 || isAddingToCart
                    ? 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-lg'
                  }
                `}
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang thêm...
                  </>
                ) : isOutOfStock || selectedVariantStock === 0 ? (
                  'Hết hàng'
                ) : (
                  <>
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>

              {/* Accordion: Description & Material */}
              <div className="divide-y divide-outline-variant/30 border-t border-b border-outline-variant/30">

                {/* Mo ta san pham */}
                <details
                  className="py-6 group"
                  open={openAccordion === 'description'}
                  onToggle={(e) => e.target.open && setOpenAccordion('description')}
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-label text-sm font-bold uppercase tracking-widest">
                      Mô tả sản phẩm
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="mt-4 text-on-surface-variant text-sm leading-relaxed space-y-3 font-body">
                    {product.description ? (
                      product.description.split('\n').map((para, i) => (
                        para.trim() && <p key={i}>{para}</p>
                      ))
                    ) : product.short_description ? (
                      <p>{product.short_description}</p>
                    ) : (
                      <p>Không có mô tả.</p>
                    )}
                  </div>
                </details>

                {/* Chat lieu & Bao quan */}
                <details
                  className="py-6 group"
                  open={openAccordion === 'material'}
                  onToggle={(e) => e.target.open && setOpenAccordion('material')}
                >
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <span className="font-label text-sm font-bold uppercase tracking-widest">
                      Chất liệu & Bảo quản
                    </span>
                    <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                      expand_more
                    </span>
                  </summary>
                  <div className="mt-4 text-on-surface-variant text-sm leading-relaxed space-y-2 font-body">
                    {product.material && <p>Chất liệu: {product.material}</p>}
                    {product.origin && <p>Xuất xứ: {product.origin}</p>}
                    {!product.material && !product.origin && (
                      <p>Không có thông tin.</p>
                    )}
                  </div>
                </details>

              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {product.related_products?.length > 0 && (
            <section className="mt-32">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-headline font-bold tracking-tighter text-on-surface uppercase">
                    Có thể bạn quan tâm
                  </h2>
                  <p className="text-on-surface-variant text-sm mt-2">
                    Sản phẩm hoàn thiện phong cách của bạn.
                  </p>
                </div>
                <Link
                  to={`/category/${product.category_slug}`}
                  className="text-primary font-label text-sm font-semibold flex items-center gap-2 hover:gap-4 transition-all"
                >
                  Xem tất cả <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {product.related_products.map((item) => (
                  <div key={item.id} className="group cursor-pointer">
                    <Link to={`/product/${item.slug}`}>
                      <div className="aspect-[3/4] bg-surface-container-low mb-4 overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.is_featured && (
                          <span className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            Mới
                          </span>
                        )}
                      </div>
                      <h3 className="font-headline font-semibold text-on-surface tracking-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-on-surface-variant text-sm font-medium mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Customer Reviews Section */}
          <section className="mt-32 bg-surface-container-low p-12" id="reviews-section">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center mb-16">
                {/* Rating Summary */}
                <div className="md:col-span-4 text-center md:text-left">
                  <h2 className="text-5xl font-headline font-bold text-on-surface mb-2">
                    {product.avg_rating?.toFixed(1) || '0'}
                  </h2>
                  <div className="flex justify-center md:justify-start items-center gap-1 text-tertiary mb-2">
                    <StarRating rating={product.avg_rating || 0} />
                  </div>
                  <p className="text-on-surface-variant font-label text-xs uppercase tracking-widest">
                    Dựa trên {product.review_count || 0} đánh giá
                  </p>
                </div>

                {/* Rating Bars */}
                <div className="md:col-span-8 flex flex-col gap-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = product.reviews?.filter(r => Math.floor(r.rating) === star).length || 0
                    const total = product.reviews?.length || 1
                    const percent = Math.round((count / total) * 100)
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <span className="font-label text-[10px] w-4">{star}</span>
                        <span className="material-symbols-outlined text-sm text-tertiary">star</span>
                        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="font-label text-[10px] text-on-surface-variant w-8">{percent}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review Form */}
              <div className="mb-16">
                <ReviewForm productId={product.id} onSuccess={() => setReviewSubmitted(v => !v)} />
              </div>

              {/* Reviews List */}
              <div className="space-y-12">
                {product.reviews?.length > 0 ? (
                  <>
                    {product.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                    {product.reviews.length >= 10 && (
                      <button className="w-full py-4 border border-primary text-primary font-label text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
                        Xem thêm đánh giá
                      </button>
                    )}
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
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductDetailPage
