import React, { useState } from 'react'
import ProductCard from './ProductCard'

const ProductSection = ({ products, title = "Sản phẩm mới", subtitle = "Những mẫu mới nhất từ studio kỹ thuật của chúng tôi." }) => {
  const [activeTab, setActiveTab] = useState('male')
  
  const tabs = [
    { id: 'male', label: 'Nam' },
    { id: 'female', label: 'Nữ' },
    { id: 'unisex', label: 'Unisex' }
  ]

  // Default products nếu không có data
  const defaultProducts = [
    {
      id: 1,
      name: 'Heavyweight Tech Tee',
      slug: 'heavyweight-tech-tee',
      price: 49.00,
      compare_price: null,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      stock: 50,
      avg_rating: 4.2,
      review_count: 24,
      is_featured: true
    },
    {
      id: 2,
      name: 'Architectural Trousers',
      slug: 'architectural-trousers',
      price: 85.00,
      compare_price: 110.00,
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
      stock: 30,
      avg_rating: 5.0,
      review_count: 12
    },
    {
      id: 3,
      name: 'Modular Layer Hoodie',
      slug: 'modular-layer-hoodie',
      price: 125.00,
      compare_price: null,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      stock: 20,
      avg_rating: 4.5,
      review_count: 48,
      is_featured: true
    },
    {
      id: 4,
      name: 'Sling System V1',
      slug: 'sling-system-v1',
      price: 65.00,
      compare_price: null,
      image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
      stock: 15,
      avg_rating: 5.0,
      review_count: 32
    }
  ]

  const displayProducts = products?.length > 0 ? products : defaultProducts

  return (
    <section className="py-20 max-w-screen-2xl mx-auto px-6 md:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h2 className="headline-font text-3xl font-bold mb-2">{title}</h2>
          {subtitle && (
            <p className="text-on-surface-variant">{subtitle}</p>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ProductSection