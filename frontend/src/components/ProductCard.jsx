import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'

const StarRating = ({ rating = 0 }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <span
        key={i}
        className="material-symbols-outlined text-xs"
        style={{
          fontVariationSettings: `'FILL' ${i < Math.floor(rating) ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 16`,
          color: i < Math.floor(rating) ? '#4F46E5' : '#CBD5E1'
        }}
      >
        star
      </span>
    ))}
  </div>
)

const ProductCard = ({ product }) => {
  const { addItem } = useCart()
  const toast = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [added, setAdded] = useState(false)

  const discount = product.discount_percent ||
    (product.compare_price && product.compare_price > product.price
      ? Math.round((1 - product.price / product.compare_price) * 100)
      : 0)
  const outOfStock = !product.is_active || product.stock === 0 || product.stock_quantity === 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem(product, 1, null, null)
    setAdded(true)
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFavorited(f => !f)
  }

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.slug}`} className="block relative">

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 mb-4 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.1)] group-hover:shadow-[0_10px_25px_-5px_rgba(79,70,229,0.15)] transition-all duration-300">
          <img
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            src={product.image_url || product.image || 'https://via.placeholder.com/400x533'}
            loading="lazy"
          />

          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-[#4F46E5]/5 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2.5 py-1 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white text-[10px] font-bold rounded-lg shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
                -{discount}%
              </span>
            )}
            {!product.is_active && outOfStock && (
              <span className="px-2.5 py-1 bg-[#0F172A]/70 text-white text-[10px] font-semibold rounded-lg">
                Hết hàng
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'
          }`}>
            <button
              onClick={handleFavorite}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 shadow-md ${
                favorited
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-white text-slate-900 hover:bg-[#4F46E5] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {favorited ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button
              className="w-9 h-9 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-[#4F46E5] hover:text-white transition-all duration-200 shadow-md"
            >
              <span className="material-symbols-outlined text-base">visibility</span>
            </button>
          </div>

          {/* Add to Cart Button */}
          {!outOfStock && (
            <button
              onClick={handleAddToCart}
              className={`absolute bottom-0 left-0 right-0 py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
                added
                  ? 'bg-slate-900 text-white'
                  : isHovered
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white translate-y-0'
                    : 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white translate-y-full'
              }`}
            >
              {added ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Đã thêm vào giỏ
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-base">shopping_cart</span>
                  Thêm vào giỏ hàng
                </span>
              )}
            </button>
          )}

          {outOfStock && (
            <div className="absolute bottom-0 left-0 right-0 py-3.5 bg-slate-100 text-slate-500 text-center text-sm font-semibold">
              Hết hàng
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-[#4F46E5] transition-colors duration-200 line-clamp-2">
                {product.name}
              </h3>
              {product.category_name && (
                <p className="text-[11px] text-slate-500 mt-0.5">{product.category_name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-sm text-slate-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={product.avg_rating || product.rating || 0} />
            {product.review_count > 0 && (
              <span className="text-[10px] text-slate-400">({product.review_count})</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
