import React, { useRef } from 'react'
import BestSellerCard from './BestSellerCard'

const ProductSection = ({ products, title = "Sản phẩm mới", subtitle = "Những thiết kế kỹ thuật được cập nhật liên tục từ studio của chúng tôi." }) => {
  const scrollRef = useRef(null)

  const defaultProducts = [
    {
      id: 1,
      name: 'Heavyweight Tech Tee',
      slug: 'heavyweight-tech-tee',
      price: 390000,
      compare_price: 490000,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      stock: 50,
      is_active: true,
      discount_percent: 20,
      avg_rating: 4.5,
      review_count: 24
    },
    {
      id: 2,
      name: 'Architectural Trousers Slim',
      slug: 'architectural-trousers',
      price: 590000,
      compare_price: 790000,
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
      stock: 30,
      is_active: true,
      discount_percent: 25,
      avg_rating: 5.0,
      review_count: 12
    },
    {
      id: 3,
      name: 'Modular Layer Hoodie',
      slug: 'modular-layer-hoodie',
      price: 790000,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      stock: 20,
      is_active: true,
      avg_rating: 4.5,
      review_count: 48
    },
    {
      id: 4,
      name: 'Sling System Backpack V2',
      slug: 'sling-system-v1',
      price: 490000,
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      stock: 15,
      is_active: true,
      avg_rating: 5.0,
      review_count: 32
    }
  ]

  const displayProducts = products?.length > 0 ? products : defaultProducts

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 310, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 md:px-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-slate-500 mt-3 max-w-sm">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll(-1)}
            className="w-12 h-12 rounded-xl border border-slate-200 text-slate-500 hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5]
              hover:shadow-[0_4px_14px_rgba(79,70,229,0.2)] transition-all duration-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">west</span>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-12 h-12 rounded-xl border border-slate-200 text-slate-500 hover:bg-[#4F46E5] hover:text-white hover:border-[#4F46E5]
              hover:shadow-[0_4px_14px_rgba(79,70,229,0.2)] transition-all duration-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">east</span>
          </button>
        </div>
      </div>

      {/* Products Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2"
      >
        {displayProducts.map(product => (
          <BestSellerCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-14 text-center">
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-[#4F46E5] font-semibold text-sm hover:gap-3 transition-all duration-200 group"
        >
          Xem tất cả sản phẩm
          <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </a>
      </div>
    </section>
  )
}

export default ProductSection
