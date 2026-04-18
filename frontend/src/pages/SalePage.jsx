import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import { productAPI } from '../services/api'
import { formatPrice } from '../utils/formatPrice'

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex text-amber-500">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm"
          style={{
            fontVariationSettings: i < Math.floor(rating) ? "'FILL' 1" : "'FILL' 0"
          }}
        >
          star
        </span>
      ))}
    </div>
  )
}

const SalePage = () => {
  const navigate = useNavigate()
  
  const [allSaleProducts, setAllSaleProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [sortBy, setSortBy] = useState('discount')
  const [page, setPage] = useState(1)
  
  const productsPerPage = 6
  
  // Danh mục cố định
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'nam', name: 'Nam' },
    { id: 'nu', name: 'Nữ' },
    { id: 'tre-em', name: 'Trẻ em' }
  ]
  
  // Slugs cho mỗi danh mục
  const categorySlugs = {
    nam: ['ao-thun-nam', 'ao-so-mi-nam', 'ao-polo-nam', 'quan-jeans-nam', 'quan-tay-nam', 'quan-short-nam', 'ao-khoac-nam', 'set-do-nam'],
    nu: ['ao-blouse-nu', 'ao-thun-nu', 'ao-croptop', 'chan-vay', 'dam-nu', 'quan-nu', 'ao-khoac-nu', 'set-do-nu'],
    'tre-em': ['ao-tre-em', 'quan-tre-em', 'vay-tre-em', 'dam-tre-em', 'bo-do-tre-em']
  }

  // Fetch sale products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const response = await productAPI.getProducts({ limit: 200 })
        
        if (response.success && response.data) {
          const saleProducts = (response.data.products || []).filter(
            p => p.compare_price && p.compare_price > p.price
          )
          setAllSaleProducts(saleProducts)
        } else {
          setAllSaleProducts([])
        }
      } catch (error) {
        console.error('Error:', error)
        setAllSaleProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Tính số lượng theo danh mục
  const categoryCounts = useMemo(() => {
    const counts = { all: allSaleProducts.length }
    
    Object.keys(categorySlugs).forEach(catId => {
      counts[catId] = allSaleProducts.filter(p => 
        categorySlugs[catId].includes(p.category_slug)
      ).length
    })
    
    return counts
  }, [allSaleProducts])

  // Filter và sort products
  const filteredProducts = useMemo(() => {
    let result = [...allSaleProducts]
    
    // Filter theo danh mục
    if (selectedCategory !== 'all') {
      const slugs = categorySlugs[selectedCategory] || []
      result = result.filter(p => slugs.includes(p.category_slug))
    }
    
    // Filter theo giá
    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    )
    
    // Sort
    switch (sortBy) {
      case 'discount':
        result.sort((a, b) => {
          const discA = a.compare_price > a.price 
            ? ((a.compare_price - a.price) / a.compare_price) * 100 : 0
          const discB = b.compare_price > b.price 
            ? ((b.compare_price - b.price) / b.compare_price) * 100 : 0
          return discB - discA
        })
        break
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'best-seller':
        result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        break
      default:
        break
    }
    
    return result
  }, [allSaleProducts, selectedCategory, priceRange, sortBy])

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage))
  const currentProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  )

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, priceRange, sortBy])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Added to cart:', product.slug)
  }

  const handleQuickView = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${product.slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-28 max-w-screen-2xl mx-auto px-12 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 uppercase tracking-widest font-label">
            <Link className="hover:text-primary transition-colors" to="/">Trang chủ</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-red-600 font-medium">Khuyến mãi</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tighter text-on-surface headline">GIẢM GIÁ</h1>
          <p className="text-base text-on-surface-variant mt-3 max-w-2xl">
            Ưu đãi lên đến 70% cho tất cả sản phẩm. Nhanh tay chọn ngay những item yêu thích với giá hời nhất!
          </p>
        </div>

        <div className="flex gap-16">
          {/* Sidebar Filter */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="space-y-12 sticky top-32">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Danh mục</h3>
                <ul className="space-y-1 text-on-surface-variant divide-y divide-outline-variant">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex justify-between items-center w-full text-left py-2 px-3 -my-px transition-all ${
                          selectedCategory === cat.id 
                            ? 'text-primary font-medium bg-primary/10' 
                            : 'hover:text-primary hover:bg-surface-container'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-50">{categoryCounts[cat.id] || 0}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Khoảng giá</h3>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="100000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-1 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary mb-4"
                  />
                  <div className="flex justify-between text-xs font-medium text-on-surface-variant font-label">
                    <span>{formatPrice(0)}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Reset Filter */}
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setPriceRange([0, 5000000])
                  setSortBy('discount')
                }}
                className="w-full py-3 text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </aside>

          {/* Product Display Area */}
          <section className="flex-grow">
            {/* Sorting & Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <p className="text-sm text-on-surface-variant font-label">
                Hiển thị {currentProducts.length} trên {filteredProducts.length} sản phẩm
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Sắp xếp theo:</span>
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="flex items-center gap-2 bg-surface-container-low px-4 py-2 text-sm font-medium hover:bg-surface-container transition-colors appearance-none cursor-pointer pr-8"
                  >
                    <option value="discount">Giảm nhiều nhất</option>
                    <option value="price-asc">Giá: Thấp → Cao</option>
                    <option value="price-desc">Giá: Cao → Thấp</option>
                    <option value="best-seller">Bán chạy</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-on-surface-variant text-lg">Không có sản phẩm nào phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8">
                {currentProducts.map((product) => {
                  const discountPercent = product.compare_price && product.compare_price > product.price
                    ? Math.round((1 - product.price / product.compare_price) * 100)
                    : 0

                  return (
                    <div key={product.id} className="product-card group cursor-pointer">
                      {/* Image */}
                      <Link 
                        to={`/product/${product.slug}`}
                        className="relative aspect-[3/4] overflow-hidden bg-surface-container-low mb-6 block"
                      >
                        <img
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          src={product.image_url || product.image || 'https://via.placeholder.com/400x600'}
                          loading="lazy"
                        />
                        
                        {/* Badges */}
                        {discountPercent > 0 && (
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            -{discountPercent}%
                          </div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                            style={{ top: discountPercent > 0 ? '36px' : '16px' }}>
                            Nổi bật
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="product-action absolute inset-0 bg-black/5 opacity-0 flex flex-col justify-end p-6 transition-all duration-300 transform translate-y-4">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white text-on-surface py-4 text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors mb-2"
                          >
                            Thêm vào giỏ
                          </button>
                          <button
                            onClick={(e) => handleQuickView(e, product)}
                            className="w-full bg-white/80 backdrop-blur-md text-on-surface py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
                          >
                            Xem chi tiết
                          </button>
                        </div>

                        {/* Favorite Button */}
                        <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-xl">favorite</span>
                        </button>
                      </Link>

                      {/* Product Info */}
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-on-surface mb-1 headline uppercase tracking-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-primary font-bold text-lg">
                              {formatPrice(product.price)}
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-on-surface-variant line-through text-sm opacity-50">
                                {formatPrice(product.compare_price)}
                              </span>
                            )}
                          </div>
                          <StarRating rating={product.avg_rating || 5} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-col items-center gap-6">
                <div className="w-full h-px bg-surface-container"></div>
                <div className="flex gap-4 items-center">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined">navigate_before</span>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1
                    // Hiển thị max 5 trang, có thêm ...
                    if (totalPages > 5 && pageNum !== 1 && pageNum !== totalPages) {
                      if (pageNum < page - 1 || pageNum > page + 1) return null
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center font-bold border-b-2 transition-colors ${
                          page === pageNum
                            ? 'text-primary border-primary'
                            : 'text-on-surface-variant border-transparent hover:text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30"
                  >
                    <span className="material-symbols-outlined">navigate_next</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  )
}

export default SalePage
