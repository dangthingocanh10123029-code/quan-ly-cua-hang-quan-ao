import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Newsletter from '../components/Newsletter'
import { productAPI } from '../services/api'
import { formatPrice } from '../utils/formatPrice'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'

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

const WomenPage = () => {
  const { addItem } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const productsPerPage = 6

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getProducts({ gender: 'female', limit: 1000 })
        if (response.success && response.data) {
          const allProducts = response.data.products || []
          
          const categoryCounts = {}
          allProducts.forEach(p => {
            if (p.category_slug) {
              categoryCounts[p.category_slug] = (categoryCounts[p.category_slug] || 0) + 1
            }
          })
          
          const totalFemale = response.data.pagination?.total || allProducts.length
          
          setCategories([
            { id: 'all', name: 'Tất cả', count: totalFemale },
            { id: 'ao-thun-nu', name: 'Áo thun', count: categoryCounts['ao-thun-nu'] || 0 },
            { id: 'ao-blouse-nu', name: 'Áo blouse', count: categoryCounts['ao-blouse-nu'] || 0 },
            { id: 'ao-croptop', name: 'Croptop', count: categoryCounts['ao-croptop'] || 0 },
            { id: 'chan-vay', name: 'Chân váy', count: categoryCounts['chan-vay'] || 0 },
            { id: 'dam-nu', name: 'Đầm', count: categoryCounts['dam-nu'] || 0 },
            { id: 'quan-nu', name: 'Quần', count: categoryCounts['quan-nu'] || 0 }
          ])
          setSizes(['XS', 'S', 'M', 'L'])
          setColors([
            { id: 1, name: 'Đen', hex: '#1a1a1a' },
            { id: 2, name: 'Trắng', hex: '#ffffff' },
            { id: 7, name: 'Hồng', hex: '#ec4899' },
            { id: 8, name: 'Hồng phấn', hex: '#f472b6' },
            { id: 9, name: 'Kem', hex: '#fef3c7' }
          ])
        }
      } catch (error) {
        console.error('Error:', error)
        setCategories([
          { id: 'all', name: 'Tất cả', count: 0 },
          { id: 'ao-thun-nu', name: 'Áo thun', count: 0 },
          { id: 'ao-blouse-nu', name: 'Áo blouse', count: 0 },
          { id: 'chan-vay', name: 'Chân váy', count: 0 },
          { id: 'dam-nu', name: 'Đầm', count: 0 },
          { id: 'quan-nu', name: 'Quần', count: 0 }
        ])
        setSizes(['XS', 'S', 'M', 'L'])
        setColors([
          { id: 1, name: 'Đen', hex: '#1a1a1a' },
          { id: 2, name: 'Trắng', hex: '#ffffff' },
          { id: 7, name: 'Hồng', hex: '#ec4899' },
          { id: 8, name: 'Hồng phấn', hex: '#f472b6' },
          { id: 9, name: 'Kem', hex: '#fef3c7' }
        ])
      }
    }
    fetchCategories()
  }, [])

  // Demo products
  const getDemoProducts = () => [
    {
      id: 11,
      name: 'Đầm Linen Cao Cấp',
      slug: 'dam-linen-cao-cap',
      price: 1590000,
      compare_price: 1990000,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
      avg_rating: 5,
      review_count: 89,
      is_on_sale: true
    },
    {
      id: 12,
      name: 'Áo Sơ Mi Lụa',
      slug: 'ao-so-mi-lua',
      price: 690000,
      image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600',
      avg_rating: 4,
      review_count: 156
    },
    {
      id: 13,
      name: 'Chân Váy Midi',
      slug: 'chan-vay-midi',
      price: 850000,
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0uj8a?w=600',
      avg_rating: 5,
      review_count: 67
    },
    {
      id: 14,
      name: 'Quần Ống Rộng',
      slug: 'quan-ung-rong',
      price: 590000,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
      avg_rating: 4,
      review_count: 234
    },
    {
      id: 15,
      name: 'Áo Khoác Blazer',
      slug: 'ao-khoac-blazer',
      price: 1890000,
      image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600',
      avg_rating: 5,
      review_count: 45,
      is_new: true
    },
    {
      id: 16,
      name: 'Váy Hoa Nhí',
      slug: 'vay-hoa-nhi',
      price: 750000,
      compare_price: 990000,
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      avg_rating: 4,
      review_count: 178,
      is_on_sale: true
    }
  ]

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = {
          gender: 'female',
          page,
          limit: productsPerPage,
          sort: sortBy === 'newest' ? 'created_at' : sortBy
        }
        
        if (selectedCategory !== 'all') {
          params.category = selectedCategory
        }
        
        const response = await productAPI.getProducts(params)
        
        if (response.success && response.data) {
          setProducts(response.data.products || [])
          setTotalPages(response.data.pagination?.total_pages || 1)
        } else {
          setProducts(getDemoProducts())
          setTotalPages(3)
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
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, sortBy, page])

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    )
    setPage(1)
  }

  const toggleColor = (colorId) => {
    setSelectedColors(prev => 
      prev.includes(colorId) 
        ? prev.filter(c => c !== colorId)
        : [...prev, colorId]
    )
    setPage(1)
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1, null, null)
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`)
  }

  const handleQuickView = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/product/${product.slug}`)
  }

  const totalProducts = products.length > 0 ? products.length * totalPages : 118

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-28 max-w-screen-2xl mx-auto px-12 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 uppercase tracking-widest font-label">
            <Link className="hover:text-primary transition-colors" to="/">Trang chủ</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-medium">Nữ</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tighter text-on-surface headline">Thời trang Nữ</h1>
          <p className="text-base text-on-surface-variant mt-3 max-w-2xl">
            Bộ sưu tập thời trang nữ với thiết kế tinh tế, phong cách hiện đại và thanh lịch. Từ những bộ đầm sang trọng đến trang phục công sở thanh lịch.
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
                        onClick={() => {
                          setSelectedCategory(cat.id)
                          setPage(1)
                        }}
                        className={`flex justify-between items-center w-full text-left py-2 px-3 -my-px transition-all ${
                          selectedCategory === cat.id 
                            ? 'text-primary font-medium bg-primary/10' 
                            : 'hover:text-primary hover:bg-surface-container'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs opacity-50">{cat.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Kích thước</h3>
                <div className="grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-2 border text-xs font-bold uppercase transition-all ${
                        selectedSizes.includes(size)
                          ? 'border-primary bg-primary text-white'
                          : 'border-outline-variant hover:border-primary hover:text-primary'
                      }`}
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
                    max="5000000"
                    step="100000"
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

              {/* Colors */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 headline">Màu sắc</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => toggleColor(color.id)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color.hex === '#ffffff' ? 'border border-outline-variant' : ''
                      } ${
                        selectedColors.includes(color.id) 
                          ? 'ring-2 ring-primary ring-offset-2' 
                          : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Display Area */}
          <section className="flex-grow">
            {/* Sorting & Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <p className="text-sm text-on-surface-variant font-label">
                Hiển thị {products.length} trên {totalProducts} sản phẩm
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Sắp xếp theo:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setPage(1)
                    }}
                    className="flex items-center gap-2 bg-surface-container-low px-4 py-2 text-sm font-medium hover:bg-surface-container transition-colors appearance-none cursor-pointer pr-8"
                  >
                    <option value="newest">Mới nhất</option>
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8">
                {products.map((product) => {
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
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 group-hover:brightness-50 transition-all duration-700"
                          src={product.image_url || product.image}
                          loading="lazy"
                        />
                        
                        {/* Badges */}
                        {discountPercent > 0 && (
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Giảm {discountPercent}%
                          </div>
                        )}
                        {product.is_new && (
                          <div className="absolute top-4 left-4 bg-secondary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Mới về
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="product-action absolute inset-0 bg-black/40 opacity-0 flex flex-col justify-end p-6 transition-all duration-300 group-hover:opacity-100">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white text-on-surface py-4 text-xs font-bold uppercase tracking-widest hover:bg-[#4F46E5] hover:text-white transition-colors mb-2"
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

            {/* Load More Section */}
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="w-full h-px bg-surface-container"></div>
              <button 
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="bg-primary text-white px-12 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-primary-container transition-all transform hover:-translate-y-1"
              >
                Xem thêm sản phẩm
              </button>
              <div className="flex gap-4">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center font-bold border-b-2 transition-colors ${
                      page === i + 1
                        ? 'text-primary border-primary'
                        : 'text-on-surface-variant border-transparent hover:text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">navigate_next</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Newsletter />
      <Footer />
    </div>
  )
}

export default WomenPage
