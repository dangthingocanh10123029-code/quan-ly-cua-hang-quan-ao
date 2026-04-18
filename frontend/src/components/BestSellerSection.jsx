import React from 'react'
import { Link } from 'react-router-dom'

const BestSellerCard = ({ product }) => {
  // Tính % đã bán
  const soldPercent = product.total_sold && product.stock !== undefined
    ? Math.min(Math.round((product.total_sold / (product.total_sold + product.stock)) * 100), 100)
    : 85

  return (
    <div className="min-w-[320px] bg-white p-6 rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all group">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block aspect-square mb-6 overflow-hidden bg-surface-container-low rounded-lg">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={product.image_url || product.image || 'https://via.placeholder.com/400'}
          loading="lazy"
        />
      </Link>

      {/* Info */}
      <Link to={`/product/${product.slug}`}>
        <h4 className="font-bold mb-4 hover:text-primary transition-colors">{product.name}</h4>
      </Link>
      
      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[11px] font-bold uppercase text-on-surface-variant">
          <span>Đã bán: {product.total_sold || 245}</span>
          <span>Còn lại: {product.stock || 15}</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${soldPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Button */}
      <Link
        to={`/product/${product.slug}`}
        className="block w-full py-3 border-2 border-on-surface font-bold hover:bg-on-surface hover:text-white transition-all text-center"
      >
        Mua ngay
      </Link>
    </div>
  )
}

const BestSellerSection = ({ products }) => {
  // Default products
  const defaultProducts = [
    {
      id: 1,
      name: 'Omni-Climate Windbreaker',
      slug: 'omni-climate-windbreaker',
      price: 199.00,
      total_sold: 245,
      stock: 15,
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'
    },
    {
      id: 2,
      name: 'Cloud-Walk Runner X',
      slug: 'cloud-walk-runner-x',
      price: 149.00,
      total_sold: 189,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
    },
    {
      id: 3,
      name: 'Urban Explorer Pack',
      slug: 'urban-explorer-pack',
      price: 89.00,
      total_sold: 156,
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'
    },
    {
      id: 4,
      name: 'Duality Tech Hoodie',
      slug: 'duality-tech-hoodie',
      price: 129.00,
      total_sold: 98,
      stock: 35,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'
    }
  ]

  const displayProducts = products?.length > 0 ? products : defaultProducts

  const handlePrev = () => {
    const container = document.getElementById('best-seller-scroll')
    if (container) {
      container.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    const container = document.getElementById('best-seller-scroll')
    if (container) {
      container.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-surface-container-low py-24">
      <div className="max-w-screen-2xl mx-auto px-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="headline-font text-4xl font-bold mb-4">Sản phẩm bán chạy</h2>
            <p className="text-on-surface-variant">
              Những thiết kế kỹ thuật được yêu thích nhất bởi cộng đồng.
            </p>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              className="p-4 rounded-full border border-outline-variant hover:bg-white transition-colors"
            >
              <span className="material-symbols-outlined">west</span>
            </button>
            <button
              onClick={handleNext}
              className="p-4 rounded-full border border-outline-variant hover:bg-white transition-colors"
            >
              <span className="material-symbols-outlined">east</span>
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          id="best-seller-scroll"
          className="flex gap-8 overflow-x-auto no-scrollbar pb-10"
        >
          {displayProducts.map((product) => (
            <BestSellerCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default BestSellerSection