import React, { useRef } from 'react'
import BestSellerCard from './BestSellerCard'

const BestSellerSection = ({ products }) => {
  const defaultProducts = [
    { id: 1, name: 'Omni-Climate Windbreaker', slug: 'omni-climate-windbreaker', price: 990000, compare_price: 1290000, total_sold: 245, stock: 15, image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
    { id: 2, name: 'Cloud-Walk Runner X', slug: 'cloud-walk-runner-x', price: 790000, total_sold: 189, stock: 40, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { id: 3, name: 'Urban Explorer Pack', slug: 'urban-explorer-pack', price: 490000, total_sold: 156, stock: 25, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400' },
    { id: 4, name: 'Duality Tech Hoodie', slug: 'duality-tech-hoodie', price: 690000, compare_price: 890000, total_sold: 98, stock: 35, image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
    { id: 5, name: 'Modular Layer Jacket', slug: 'modular-layer-jacket', price: 1290000, total_sold: 67, stock: 12, image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
    { id: 6, name: 'Tech Cargo Pants', slug: 'tech-cargo-pants', price: 590000, total_sold: 134, stock: 28, image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400' },
  ]

  const displayProducts = products?.length > 0 ? products : defaultProducts
  const scrollRef = useRef(null)

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
            Sản phẩm <span className="gradient-text">bán chạy</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-sm">
            Những thiết kế được yêu thích nhất bởi cộng đồng.
          </p>
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

export default BestSellerSection
