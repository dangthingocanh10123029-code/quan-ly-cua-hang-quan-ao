import React from 'react'
import { Link } from 'react-router-dom'

const CategorySection = ({ categories }) => {
  const defaultCategories = [
    {
      id: 1,
      name: 'Áo Thun',
      slug: 'ao-thun',
      subtitle: '150+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
      accent: '#0052FF'
    },
    {
      id: 2,
      name: 'Quần Jeans',
      slug: 'quan-jeans',
      subtitle: '80+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
      accent: '#4D7CFF'
    },
    {
      id: 3,
      name: 'Áo Khoác',
      slug: 'ao-khoac',
      subtitle: '60+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      accent: '#0052FF'
    },
    {
      id: 4,
      name: 'Phụ Kiện',
      slug: 'phu-kien',
      subtitle: '200+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
      accent: '#4D7CFF'
    }
  ]

  const displayCategories = categories?.length > 0
    ? categories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subtitle: cat.description || `${index * 50 + 50}+ sản phẩm`,
        image: cat.image || defaultCategories[index]?.image,
        accent: defaultCategories[index]?.accent || '#0052FF'
      }))
    : defaultCategories

  return (
    <section className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 md:px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] text-slate-900 leading-tight mb-3">
            Danh Mục <span className="gradient-text">Nổi Bật</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-lg">
            Khám phá những bộ sưu tập thời trang được yêu thích nhất, mang đến phong cách hoàn hảo cho mọi dịp
          </p>
        </div>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 text-[#4F46E5] font-semibold text-sm hover:gap-3 transition-all duration-200 group"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {/* Category Grid - Magazine Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

        {/* Featured Card - Large & Tall */}
        <div className="md:col-span-2 lg:col-span-7 lg:row-span-2 group">
          <Link
            to={`/search?category=${displayCategories[0].slug}`}
            className="relative block h-[380px] md:h-[420px] lg:h-full overflow-hidden rounded-2xl"
          >
            <img
              src={displayCategories[0].image}
              alt={displayCategories[0].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient overlay - stronger at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Large accent bar */}
            <div
              className="absolute top-8 left-8 h-1 w-14 rounded-full opacity-80 shadow-[0_0_12px_rgba(79,70,229,0.5)]"
              style={{ background: displayCategories[0].accent || '#4F46E5' }}
            />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <span className="inline-block text-white/40 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3">
                Nổi Bật Nhất
              </span>
              <h3 className="text-white text-3xl md:text-4xl font-bold mb-2 font-display tracking-[-0.02em] group-hover:translate-x-2 transition-transform duration-300">
                {displayCategories[0].name}
              </h3>
              <p className="text-white/50 text-sm mb-6">
                {displayCategories[0].subtitle}
              </p>
              <div className="inline-flex items-center gap-2 text-white font-semibold text-sm group/btn">
                <span>Khám phá ngay</span>
                <span className="material-symbols-outlined text-base group-hover/btn:translate-x-2 transition-transform duration-300">
                  arrow_forward
                </span>
              </div>
            </div>

            {/* Hover Border with colored glow */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 shadow-[inset_0_0_30px_rgba(79,70,229,0.1)] transition-all duration-500" />
          </Link>
        </div>

        {/* Top Right Card */}
        <div className="lg:col-span-5 group">
          <Link
            to={`/search?category=${displayCategories[1].slug}`}
            className="relative block h-[180px] md:h-[200px] overflow-hidden rounded-2xl"
          >
            <img
              src={displayCategories[1].image}
              alt={displayCategories[1].name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Accent bar */}
            <div
              className="absolute top-6 left-6 h-0.5 w-10 rounded-full"
              style={{ background: displayCategories[1].accent || '#4F46E5' }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h3 className="text-white text-xl md:text-2xl font-bold mb-1 font-display tracking-[-0.02em] group-hover:translate-x-2 transition-transform duration-300">
                {displayCategories[1].name}
              </h3>
              <p className="text-white/50 text-xs">{displayCategories[1].subtitle}</p>
            </div>

            <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500" />
          </Link>
        </div>

        {/* Bottom Right Cards */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-6">
          {[2, 3].map(i => (
            <div key={i} className="group">
              <Link
                to={`/search?category=${displayCategories[i].slug}`}
                className="relative block h-[180px] md:h-[200px] overflow-hidden rounded-2xl"
              >
                <img
                  src={displayCategories[i].image}
                  alt={displayCategories[i].name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Small accent indicator */}
                <div className="absolute top-5 left-5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: displayCategories[i].accent || '#4F46E5' }}
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-lg font-bold mb-0.5 font-display tracking-[-0.02em] group-hover:translate-x-1 transition-transform duration-300">
                    {displayCategories[i].name}
                  </h3>
                  <p className="text-white/50 text-xs">{displayCategories[i].subtitle}</p>
                </div>

                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
