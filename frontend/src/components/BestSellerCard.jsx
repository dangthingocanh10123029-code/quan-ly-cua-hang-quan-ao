import React from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'

const BestSellerCard = ({ product }) => {
  const soldPercent = product.total_sold && product.stock !== undefined
    ? Math.min(Math.round((product.total_sold / (product.total_sold + product.stock)) * 100), 100)
    : 85

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0

  return (
    <div className="min-w-[300px] flex-shrink-0 bg-white rounded-xl border border-slate-100
      hover:shadow-[0_10px_25px_rgba(79,70,229,0.12)] hover:border-[#4F46E5]/20
      transition-all duration-300 group overflow-hidden hover:-translate-y-1">

      {/* Horizontal Layout: Image left, Info right */}
      <div className="flex">

        {/* Image */}
        <Link to={`/product/${product.slug}`} className="block relative">
          <div className="w-36 h-[160px] bg-slate-100 overflow-hidden flex-shrink-0">
            <img
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={product.image_url || product.image || 'https://via.placeholder.com/400x533'}
              loading="lazy"
            />
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_2px_8px_rgba(79,70,229,0.3)]">
                -{discount}%
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 p-5 flex flex-col justify-center gap-3">
          <Link to={`/product/${product.slug}`}>
            <h4 className="font-semibold text-slate-900 text-sm group-hover:text-[#4F46E5] transition-colors leading-snug line-clamp-2 mb-1">
              {product.name}
            </h4>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900">{formatPrice(product.price)}</span>
            {product.compare_price > product.price && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full transition-all duration-700"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4F46E5]" style={{ fontSize: '12px' }}>local_fire_department</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Đã bán {product.total_sold || 245}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BestSellerCard
