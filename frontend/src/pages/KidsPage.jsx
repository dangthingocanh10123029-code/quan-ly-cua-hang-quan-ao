import React, { useState, useEffect } from 'react'
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

const KidsPage = () => {
  const navigate = useNavigate()
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([
    { id: 'all', name: 'Tất cả', count: 0 },
    { id: 'ao-tre-em', name: 'Áo Trẻ Em', count: 0 },
    { id: 'quan-tre-em', name: 'Quần Trẻ Em', count: 0 },
    { id: 'vay-tre-em', name: 'Váy Trẻ Em', count: 0 },
    { id: 'dam-tre-em', name: 'Đầm Trẻ Em', count: 0 },
    { id: 'bo-do-tre-em', name: 'Bộ Đồ Trẻ Em', count: 0 }
  ])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 2000000])
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const productsPerPage = 6

  // Fetch categories cho trẻ em
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getKidsCategories()
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Demo products - chỉ sản phẩm trẻ em với category_slug đúng
  const getDemoProducts = () => [
    {
      id: 32,
      name: 'Áo Thun Bé Trai',
      slug: 'ao-thun-tre-em-be-trai-cars',
      price: 159000,
      compare_price: 190000,
      image: 'https://images.unsplash.com/photo-1617609180892-e5f3b73d3dc4?w=600',
      avg_rating: 5,
      review_count: 89,
      is_on_sale: true,
      category_slug: 'ao-tre-em'
    },
    {
      id: 38,
      name: 'Váy Xếp Ly Trẻ Em',
      slug: 'vay-xep-ly-tre-em',
      price: 229000,
      image: 'https://images.unsplash.com/photo-1518831959646-742c15d9fb95?w=600',
      avg_rating: 4,
      review_count: 156,
      category_slug: 'vay-tre-em'
    },
    {
      id: 42,
      name: 'Bộ Đồ Thể Thao',
      slug: 'bo-do-the-thao-tre-em',
      price: 299000,
      image: 'https://images.unsplash.com/photo-1445796886651-d31a2c15f3c9?w=600',
      avg_rating: 5,
      review_count: 67,
      category_slug: 'bo-do-tre-em'
    },
    {
      id: 35,
      name: 'Quần Jean Trẻ Em',
      slug: 'quan-jeans-tre-em-be-gai',
      price: 249000,
      image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600',
      avg_rating: 4,
      review_count: 234,
      category_slug: 'quan-tre-em'
    },
    {
      id: 39,
      name: 'Đầm Xòe Trẻ Em',
      slug: 'dam-xoe-tre-em',
      price: 299000,
      image: 'https://images.unsplash.com/photo-1518831959646-742c15d9fb95?w=600',
      avg_rating: 5,
      review_count: 45,
      is_new: true,
      category_slug: 'dam-tre-em'
    },
    {
      id: 33,
      name: 'Áo Thun Bé Gái Hoa',
      slug: 'ao-thun-tre-em-be-gai-hoa',
      price: 149000,
      compare_price: 180000,
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
      avg_rating: 4,
      review_count: 178,
      is_on_sale: true,
      category_slug: 'ao-tre-em'
    }
  ]

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        // Kids products - luôn filter by age_group = 'kids'
        const params = {
          page,
          limit: productsPerPage,
          sort: sortBy === 'newest' ? 'created_at' : sortBy,
          age_group: 'kids'
        }

        if (selectedCategory !== 'all') {
          params.category = selectedCategory
        }

        const response = await productAPI.getProducts(params)

        // Backend trả về { success: true, data: { products: [...], pagination: {...} } }
        // Axios interceptor trả về response.data nên response = { success: true, data: {...} }
        if (response.success && response.data?.products?.length > 0) {
          // API không filter đúng theo age_group nên filter phía client
          const kidsProducts = response.data.products.filter(p => 
            p.age_group === 'kids' || 
            p.category_slug?.includes('tre-em') ||
            p.category_slug === 'ao-tre-em' ||
            p.category_slug === 'quan-tre-em' ||
            p.category_slug === 'vay-tre-em' ||
            p.category_slug === 'dam-tre-em' ||
            p.category_slug === 'bo-do-tre-em'
          )
          if (kidsProducts.length > 0) {
            setProducts(kidsProducts)
            setTotalPages(2)
          } else {
            setProducts(getDemoProducts())
            setTotalPages(2)
          }
        } else {
          // Fallback: hiển thị demo products (chỉ trẻ em)
          setProducts(getDemoProducts())
          setTotalPages(2)
        }
      } catch (error) {
        console.error('Error:', error)
        setProducts(getDemoProducts())
        setTotalPages(3)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [page, sortBy, selectedCategory])

  const toggleSize = (size) => {
    // Kids size filter
    setPage(1)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setPage(1)
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

  const totalProducts = products.length > 0 ? products.length * totalPages : 20

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-28 max-w-screen-2xl mx-auto px-12 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 uppercase tracking-widest font-label">
            <Link className="hover:text-primary transition-colors" to="/">Trang chủ</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-medium">Trẻ em</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tighter text-on-surface headline">TRẺ EM</h1>
          <p className="text-base text-on-surface-variant mt-3 max-w-2xl">
            Thời trang đáng yêu cho bé yêu với chất liệu mềm mại, thoáng khí và thiết kế vui nhộn. Giúp bé tự tin thể hiện phong cách riêng từ những năm tháng đầu đời.
          </p>
        </div>

        <div className="flex gap-16">
          {/* Sidebar Filter */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="space-y-12 sticky top-32">
              {/* Categories - Chỉ hiển thị danh mục trẻ em */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Danh mục</h3>
                <ul className="space-y-1 text-on-surface-variant divide-y divide-outline-variant">
                  {/* Tất cả - lấy tổng số từ tất cả categories */}
                  <li>
                    <button
                      onClick={() => {
                        setSelectedCategory('all')
                        setPage(1)
                      }}
                      className={`flex justify-between items-center w-full text-left py-2 px-3 -my-px transition-all ${
                        selectedCategory === 'all' 
                          ? 'text-primary font-medium bg-primary/10' 
                          : 'hover:text-primary hover:bg-surface-container'
                      }`}
                    >
                      <span>Tất cả</span>
                      <span className="text-xs opacity-50">
                        {categories.find(c => c.id === 'all')?.count || 0}
                      </span>
                    </button>
                  </li>
                  {/* Danh mục trẻ em - lấy count từ categories state */}
                  {['ao-tre-em', 'quan-tre-em', 'vay-tre-em', 'dam-tre-em', 'bo-do-tre-em'].map((slug) => {
                    const catNames = {
                      'ao-tre-em': 'Áo Trẻ Em',
                      'quan-tre-em': 'Quần Trẻ Em', 
                      'vay-tre-em': 'Váy Trẻ Em',
                      'dam-tre-em': 'Đầm Trẻ Em',
                      'bo-do-tre-em': 'Bộ Đồ Trẻ Em'
                    }
                    const catCount = categories.find(c => c.id === slug)?.count || 0
                    return (
                      <li key={slug}>
                        <button
                          onClick={() => {
                            setSelectedCategory(slug)
                            setPage(1)
                          }}
                          className={`flex justify-between items-center w-full text-left py-2 px-3 -my-px transition-all ${
                            selectedCategory === slug 
                              ? 'text-primary font-medium bg-primary/10' 
                              : 'hover:text-primary hover:bg-surface-container'
                          }`}
                        >
                          <span>{catNames[slug]}</span>
                          {catCount > 0 && <span className="text-xs opacity-50">{catCount}</span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Kích thước</h3>
                <div className="flex flex-wrap gap-2">
                  {['3-4T', '5-6T', '7-8T', '8-9T'].map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className="w-10 h-10 border border-outline rounded-md text-xs font-medium hover:border-primary hover:text-primary transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Khoảng giá</h3>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="2000000"
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], Number(e.target.value)])
                      setPage(1)
                    }}
                    className="w-full h-1 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary mb-4"
                  />
                  <div className="flex justify-between text-xs font-medium text-on-surface-variant font-label">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Kids Banner */}
              <div className="bg-secondary-container text-on-secondary-container p-6 rounded-xl">
                <span className="material-symbols-outlined text-4xl mb-4 block">child_care</span>
                <h3 className="text-sm font-bold uppercase tracking-widest mb-2 headline">Ưu đãi trẻ em</h3>
                <p className="text-xs opacity-80">Giảm 15% cho đơn hàng đầu tiên của bé</p>
              </div>
            </div>
          </aside>

          {/* Product Display Area */}
          <section className="flex-grow">
            {/* Sorting & Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <p className="text-sm text-on-surface-variant font-label">
                Hiển thị {products.length} sản phẩm
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Sắp xếp theo:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="appearance-none bg-transparent border-b border-outline px-2 py-1 pr-8 text-sm font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá: Thấp đến Cao</option>
                    <option value="price_desc">Giá: Cao đến Thấp</option>
                    <option value="name">Tên A-Z</option>
                  </select>
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-sm pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-surface-container rounded-xl aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-surface-container rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-surface-container rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div 
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <div className="relative rounded-xl overflow-hidden bg-surface-container aspect-[3/4] mb-4">
                      <img 
                        src={product.image || product.image_url || 'https://via.placeholder.com/400x533'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.is_new && (
                          <span className="bg-secondary text-on-secondary text-[10px] font-bold uppercase px-2 py-1 rounded">
                            Mới
                          </span>
                        )}
                        {product.is_on_sale && (
                          <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-1 rounded">
                            -{Math.round((1 - product.price / product.compare_price) * 100)}%
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => handleQuickView(e, product)}
                            className="flex-1 bg-white text-on-surface py-2 rounded-lg text-xs font-bold uppercase hover:bg-primary hover:text-white transition-colors"
                          >
                            Xem nhanh
                          </button>
                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">shopping_bag</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-label">
                        {product.brand_name || product.category_name || 'Trẻ em'}
                      </p>
                      <h3 className="text-sm font-medium text-on-surface line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <StarRating rating={product.avg_rating || 0} />
                        <span className="text-xs text-on-surface-variant">({product.review_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm font-bold text-red-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price > product.price && (
                          <span className="text-xs text-on-surface-variant line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-full font-medium transition-colors ${
                      page === i + 1 
                        ? 'bg-primary text-white' 
                        : 'border border-outline hover:border-primary hover:text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full border border-outline flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
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

export default KidsPage
