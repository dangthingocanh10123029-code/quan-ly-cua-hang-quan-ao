import React from 'react'
import { Link } from 'react-router-dom'

const BrandSection = ({ brands }) => {
  // Default brands
  const defaultBrands = [
    { id: 1, name: 'NIKE', slug: 'nike' },
    { id: 2, name: 'ADIDAS', slug: 'adidas' },
    { id: 3, name: 'ZARA', slug: 'zara' },
    { id: 4, name: 'H&M', slug: 'hm' },
    { id: 5, name: 'UNIQLO', slug: 'uniqlo' }
  ]

  const displayBrands = brands?.length > 0 ? brands : defaultBrands

  return (
    <section className="py-16 border-y border-outline-variant/30">
      <div className="max-w-screen-2xl mx-auto px-8 overflow-hidden">
        <div className="flex justify-around items-center gap-20">
          {displayBrands.map((brand) => (
            <Link
              to={`/search?brand=${brand.slug}`}
              key={brand.id}
              className="hover:opacity-70 transition-all duration-300 cursor-pointer"
            >
              <span className="font-serif font-bold text-2xl tracking-wider text-gray-900 hover:text-primary transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BrandSection