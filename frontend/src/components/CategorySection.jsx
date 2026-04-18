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
      accent: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Quần Jeans',
      slug: 'quan-jeans',
      subtitle: '80+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
      accent: 'bg-indigo-500'
    },
    {
      id: 3,
      name: 'Áo Khoác',
      slug: 'ao-khoac',
      subtitle: '60+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
      accent: 'bg-slate-600'
    },
    {
      id: 4,
      name: 'Phụ Kiện',
      slug: 'phu-kien',
      subtitle: '200+ sản phẩm',
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80',
      accent: 'bg-amber-500'
    }
  ]

  // Use categories from props (database) or fallback to default
  const displayCategories = categories?.length > 0 ? categories.map((cat, index) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    subtitle: cat.description || `${index * 50 + 50}+ sản phẩm`,
    image: cat.image || defaultCategories[index]?.image,
    accent: defaultCategories[index]?.accent || 'bg-blue-500'
  })) : defaultCategories

  return (
    <section className="py-20 bg-gradient-to-b from-white to-neutral-50/50">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-[0.25em] text-primary uppercase mb-3">
            Bộ Sưu Tập
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Danh Mục Nổi Bật
          </h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto">
            Khám phá những bộ sưu tập thời trang được yêu thích nhất, 
            mang đến phong cách hoàn hảo cho mọi dịp
          </p>
          
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-px bg-neutral-200"></div>
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <div className="w-12 h-px bg-neutral-200"></div>
          </div>
        </div>

        {/* Category Grid - Modern Magazine Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          
          {/* Featured Card - Large */}
          <div className="md:col-span-2 lg:col-span-7 lg:row-span-2 group">
            <Link
              to={`/category/${displayCategories[0].slug}`}
              className="relative block h-[320px] md:h-[400px] lg:h-full overflow-hidden rounded-2xl"
            >
              {/* Background Image */}
              <img
                src={displayCategories[0].image}
                alt={displayCategories[0].name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              
              {/* Accent Bar */}
              <div className={`absolute top-6 left-6 w-12 h-1 ${displayCategories[0].accent} rounded-full`}></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block text-white/60 text-xs font-medium tracking-widest uppercase mb-2">
                  Nổi Bật
                </span>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
                  {displayCategories[0].name}
                </h3>
                <p className="text-white/70 text-sm mb-4">
                  {displayCategories[0].subtitle}
                </p>
                
                {/* CTA Button */}
                <div className="flex items-center gap-2 text-white font-medium text-sm group/btn">
                  <span>Xem Ngay</span>
                  <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-2 transition-transform duration-300">
                    arrow_forward
                  </span>
                </div>
              </div>
              
              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
            </Link>
          </div>

          {/* Top Right Card */}
          <div className="lg:col-span-5 group">
            <Link
              to={`/category/${displayCategories[1].slug}`}
              className="relative block h-[180px] md:h-[190px] overflow-hidden rounded-2xl"
            >
              <img
                src={displayCategories[1].image}
                alt={displayCategories[1].name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className={`inline-block w-8 h-0.5 ${displayCategories[1].accent} rounded-full mb-2`}></div>
                <h3 className="text-white text-xl font-bold mb-1 group-hover:translate-x-2 transition-transform duration-300">
                  {displayCategories[1].name}
                </h3>
                <p className="text-white/60 text-xs">{displayCategories[1].subtitle}</p>
              </div>
              
              <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
            </Link>
          </div>

          {/* Bottom Right Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-5">
            {/* Card 3 */}
            <div className="group">
              <Link
                to={`/category/${displayCategories[2].slug}`}
                className="relative block h-[180px] md:h-[190px] overflow-hidden rounded-2xl"
              >
                <img
                  src={displayCategories[2].image}
                  alt={displayCategories[2].name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className={`inline-block w-6 h-0.5 ${displayCategories[2].accent} rounded-full mb-2`}></div>
                  <h3 className="text-white text-lg font-bold mb-0.5 group-hover:translate-x-1 transition-transform duration-300">
                    {displayCategories[2].name}
                  </h3>
                  <p className="text-white/60 text-xs">{displayCategories[2].subtitle}</p>
                </div>
                
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
              </Link>
            </div>

            {/* Card 4 */}
            <div className="group">
              <Link
                to={`/category/${displayCategories[3].slug}`}
                className="relative block h-[180px] md:h-[190px] overflow-hidden rounded-2xl"
              >
                <img
                  src={displayCategories[3].image}
                  alt={displayCategories[3].name}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className={`inline-block w-6 h-0.5 ${displayCategories[3].accent} rounded-full mb-2`}></div>
                  <h3 className="text-white text-lg font-bold mb-0.5 group-hover:translate-x-1 transition-transform duration-300">
                    {displayCategories[3].name}
                  </h3>
                  <p className="text-white/60 text-xs">{displayCategories[3].subtitle}</p>
                </div>
                
                <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/20 transition-all duration-500"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategorySection
