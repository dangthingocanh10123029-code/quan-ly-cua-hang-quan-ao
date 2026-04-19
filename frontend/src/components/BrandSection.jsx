import React from 'react'
import { Link } from 'react-router-dom'

const BrandSection = ({ brands }) => {
  const defaultBrands = [
    { id: 1, name: 'NIKE', slug: 'nike' },
    { id: 2, name: 'ADIDAS', slug: 'adidas' },
    { id: 3, name: 'ZARA', slug: 'zara' },
    { id: 4, name: 'H&M', slug: 'hm' },
    { id: 5, name: 'UNIQLO', slug: 'uniqlo' },
    { id: 6, name: 'GUCCI', slug: 'gucci' },
    { id: 7, name: 'PRADA', slug: 'prada' },
    { id: 8, name: "LEVI'S", slug: 'levis' },
  ]

  const displayBrands = brands?.length > 0 ? brands : defaultBrands
  const marqueeItems = [...displayBrands, ...displayBrands, ...displayBrands]

  return (
    <section className="py-20 border-y border-slate-100 bg-white overflow-hidden relative">
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4F46E5]/20 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-10">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900">
            Thương Hiệu <span className="gradient-text">Nổi Bật</span>
          </h2>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative">
        <div className="flex overflow-hidden no-scrollbar">
          <div className="flex gap-16 items-center animate-marquee">
            {marqueeItems.map((brand, i) => (
              <Link
                key={`${brand.id}-${i}`}
                to={`/search?brand=${brand.slug}`}
                className="flex-shrink-0 group"
              >
                <span
                  className="font-display text-xl md:text-2xl font-bold tracking-[0.15em]
                    bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-400
                    group-hover:from-[#4F46E5] group-hover:to-[#7C3AED]
                    transition-all duration-500"
                  style={{ WebkitTextStroke: '0px' }}
                >
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
      </div>
    </section>
  )
}

export default BrandSection
