import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice'

// Timer cố định cho demo: 8 tiếng 30 phút 15 giây (tính 1 lần)
const DEMO_END_TIME = (() => {
  const now = new Date()
  now.setHours(now.getHours() + 8)
  now.setMinutes(now.getMinutes() + 30)
  now.setSeconds(now.getSeconds() + 15)
  return now.getTime()
})()

const FlashSale = ({ flashSaleData }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const navigate = useNavigate()

  // Sample products
  const sampleProducts = useMemo(() => [
    {
      id: 1,
      name: 'Áo Thun nam cổ tròn cao cấp',
      slug: 'ao-thun-nam-co-tron',
      price: 199000,
      compare_price: 350000,
      stock: 12,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
      discount_percent: 43,
      sale_end_time: DEMO_END_TIME
    },
    {
      id: 2,
      name: 'Áo Sơ Mi Nữ Form Rộng',
      slug: 'ao-so-mi-nu-form-rong',
      price: 299000,
      compare_price: 450000,
      stock: 3,
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
      discount_percent: 33,
      sale_end_time: DEMO_END_TIME
    },
    {
      id: 3,
      name: 'Quần Jean Nam Slim Fit',
      slug: 'quan-jean-nam-slim',
      price: 399000,
      compare_price: 699000,
      stock: 8,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
      discount_percent: 43,
      sale_end_time: DEMO_END_TIME
    }
  ], [])

  // Lấy products từ DB hoặc sample
  const products = flashSaleData?.products?.length > 0 ? flashSaleData.products : sampleProducts

  // Lấy thời gian kết thúc
  const targetTime = useMemo(() => {
    // Ưu tiên timer từ DB
    if (flashSaleData?.timer && (flashSaleData.timer.hours > 0 || flashSaleData.timer.minutes > 0 || flashSaleData.timer.seconds > 0)) {
      const now = new Date()
      return new Date(now.getTime() + 
        flashSaleData.timer.hours * 3600000 + 
        flashSaleData.timer.minutes * 60000 + 
        flashSaleData.timer.seconds * 1000
      ).getTime()
    }
    // Lấy từ product
    if (products[0]?.sale_end_time) {
      return products[0].sale_end_time
    }
    return null
  }, [flashSaleData, products])

  // Timer countdown
  useEffect(() => {
    if (!targetTime) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = targetTime - now

      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000)
        })
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  const formatTime = (num) => num.toString().padStart(2, '0')

  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`)
  }

  const handleAddToCart = (e, product) => {
    e.stopPropagation()
    console.log('Added to cart:', product.slug)
  }

  const displayProducts = products.slice(0, 3)

  return (
    <section className="bg-[#0f172a] py-16 md:py-24 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
          
          {/* Left Column - Title & Timer */}
          <div className="lg:w-[35%] flex flex-col lg:sticky lg:top-24">
            
            {/* Limited Time Badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6 w-fit">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-semibold text-xs uppercase tracking-[0.2em]">
                Limited Time
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[0.85]">
              FLASH<br />
              <span className="text-red-500">SALE</span>
            </h2>

            <p className="text-slate-400 text-sm mb-10 max-w-[300px] leading-relaxed">
              Ưu đãi chỉ trong thời gian giới hạn. Nhanh tay kẻo hết!
            </p>

            {/* Countdown Timer */}
            <div className="flex gap-3">
              <TimeBox value={formatTime(timeLeft.hours)} label="Hours" />
              <Separator />
              <TimeBox value={formatTime(timeLeft.minutes)} label="Minutes" />
              <Separator />
              <TimeBox value={formatTime(timeLeft.seconds)} label="Seconds" isHighlight />
            </div>
          </div>

          {/* Right Column - Product Grid */}
          <div className="lg:w-[65%]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((product, index) => {
                const discount = product.discount_percent ||
                  product.sale_percent ||
                  (product.compare_price > product.price
                    ? Math.round((1 - product.price / product.compare_price) * 100)
                    : 0)

                const saveLabels = ['SAVE 40%', 'SAVE 25%', 'SAVE 50%']

                return (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => handleProductClick(product.slug)}
                  >
                    {/* Product Card */}
                    <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
                      
                      {/* Product Image */}
                      <div className="relative h-[260px] overflow-hidden bg-slate-800">
                        <img
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={product.image_url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80'}
                          loading="lazy"
                        />
                        
                        {/* Sale Badge */}
                        {discount > 0 && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-lg">
                            {saveLabels[index] || `SAVE ${discount}%`}
                          </div>
                        )}

                        {/* Stock Badge */}
                        {product.stock > 0 && product.stock <= 5 && (
                          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white/90 text-[10px] font-medium px-2 py-1 rounded-md">
                            Only {product.stock} left
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5">
                        <h4 className="font-semibold text-white text-base mb-3 group-hover:text-red-400 transition-colors duration-300 leading-tight line-clamp-2">
                          {product.name}
                        </h4>

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-xl font-bold text-red-500">
                            {formatPrice(product.price)}
                          </span>
                          {product.compare_price > product.price && (
                            <span className="text-sm text-slate-500 line-through">
                              {formatPrice(product.compare_price)}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        {(!product.stock || product.stock === 0) ? (
                          <div className="text-center text-slate-500 text-sm py-2">
                            Hết hàng
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white/10 hover:bg-red-500 text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                          >
                            Thêm vào giỏ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Time Box Component
const TimeBox = ({ value, label, isHighlight = false }) => (
  <div className="flex flex-col items-center">
    <div className={`rounded-xl p-3 w-[70px] h-[75px] flex flex-col items-center justify-center shadow-lg ${
      isHighlight 
        ? 'bg-red-500/20 border border-red-500/30' 
        : 'bg-slate-800/80 border border-slate-700/50'
    }`}>
      <span className={`text-2xl md:text-3xl font-bold font-mono ${isHighlight ? 'text-red-500' : 'text-white'}`}>
        {value}
      </span>
    </div>
    <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 mt-2 font-medium">
      {label}
    </span>
  </div>
)

// Separator Component
const Separator = () => (
  <div className="flex flex-col items-center justify-center pt-1">
    <span className="text-xl font-bold text-slate-600">:</span>
  </div>
)

export default FlashSale
