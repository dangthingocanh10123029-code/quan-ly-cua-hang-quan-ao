import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../contexts/CartContext'

const StarRating = ({ rating = 0, maxRating = 5 }) => {
  return (
    <div className="flex text-amber-500">
      {[...Array(maxRating)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[14px]"
          style={{
            fontVariationSettings: i < Math.floor(rating) ? "'FILL' 1" : i < rating ? "'FILL' 0" : "'FILL' 0"
          }}
        >
          {i < Math.floor(rating) ? 'star' : i < rating ? 'star_half' : 'star'}
        </span>
      ))}
    </div>
  )
}

const ProductCard = ({ product }) => {
  const { addItem } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAdded, setShowAdded] = useState(false)
  const navigate = useNavigate()

  // Tính % giảm giá từ Database
  const discountPercent = product.discount_percent ||
    (product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : 0)

  const isOutOfStock = product.is_out_of_stock || product.stock === 0
  const isOnSale = product.is_on_sale || discountPercent > 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Thêm vào giỏ hàng với CartContext
    addItem(product, 1, null, null)
    
    // Hiện thông báo đã thêm
    setShowAdded(true)
    setTimeout(() => setShowAdded(false), 2000)
  }

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${product.slug}`)
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] mb-6 overflow-hidden bg-surface-container-low">
        {/* Main Image */}
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
            isHovered ? 'opacity-50 scale-105' : 'opacity-100 scale-100'
          }`}
          src={product.image_url || product.image || 'https://via.placeholder.com/400x533'}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />

        {/* Badges */}
        {isOnSale && (
          <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase">
            Giảm giá
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute top-4 left-4 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 uppercase">
            Hết hàng
          </span>
        )}
        {product.is_featured && !isOnSale && !isOutOfStock && (
          <span className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase">
            Nổi bật
          </span>
        )}

        {/* Savings Badge */}
        {isOnSale && discountPercent > 0 && (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
            <span className="text-[11px] font-bold text-red-600">
              Tiết kiệm {discountPercent}%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <button
            onClick={handleFavorite}
            className={`bg-white p-2 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors ${
              isFavorited ? 'text-red-500' : 'text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isFavorited ? 'favorite' : 'favorite_border'}
            </span>
          </button>
          <button
            onClick={handleQuickView}
            className="bg-white p-2 rounded-full shadow hover:bg-primary hover:text-white transition-colors text-slate-600"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
          </button>
        </div>

        {/* Add to Cart Button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 left-0 w-full bg-slate-900 text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium text-center cursor-pointer"
          >
            {showAdded ? '✓ Đã thêm!' : 'Thêm vào giỏ hàng'}
          </button>
        )}
        
        {/* Added to Cart Notification */}
        {showAdded && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-sm align-middle mr-1">check</span>
            Đã thêm vào giỏ!
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex justify-between items-start mb-2">
        <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors flex-1">
          <h3 className="font-medium text-sm">
            {product.name}
          </h3>
          {product.category_name && (
            <p className="text-xs text-on-surface-variant mt-1">{product.category_name}</p>
          )}
        </Link>
        <div className="text-right ml-2">
          <span className={`text-sm font-bold ${isOnSale ? 'text-red-600' : ''}`}>
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="text-[10px] text-on-surface-variant line-through block">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
      </div>

      {/* Brand */}
      {product.brand_name && (
        <p className="text-xs text-on-surface-variant mb-2">{product.brand_name}</p>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2">
        <StarRating rating={product.avg_rating || product.rating || 0} />
        {product.review_count > 0 && (
          <span className="text-[10px] text-on-surface-variant font-medium">
            ({product.review_count} đánh giá)
          </span>
        )}
      </div>
    </div>
  )
}

export default ProductCard
