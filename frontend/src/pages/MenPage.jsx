import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
          {i < Math.floor(rating) ? 'star' : 'star'}
        </span>
      ))}
    </div>
  )
}

const MenPage = () => {
  const [searchParams] = useSearchParams()
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

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Lấy tất cả sản phẩm nam để đếm theo category
        const response = await productAPI.getProducts({ gender: 'male', limit: 1000 })
        if (response.success && response.data) {
          const allProducts = response.data.products || []
          
          // Đếm số sản phẩm theo category
          const categoryCounts = {}
          allProducts.forEach(p => {
            if (p.category_slug) {
              categoryCounts[p.category_slug] = (categoryCounts[p.category_slug] || 0) + 1
            }
          })
          
          const totalMale = response.data.pagination?.total || allProducts.length
          
          setCategories([
            { id: 'all', name: 'Tất cả', count: totalMale },
            { id: 'ao-thun-nam', name: 'Áo thun', count: categoryCounts['ao-thun-nam'] || 0 },
            { id: 'ao-so-mi-nam', name: 'Sơ mi', count: categoryCounts['ao-so-mi-nam'] || 0 },
            { id: 'quan-jeans-nam', name: 'Quần', count: (categoryCounts['quan-jeans-nam'] || 0) + (categoryCounts['quan-tay-nam'] || 0) + (categoryCounts['quan-short-nam'] || 0) },
            { id: 'ao-khoac-nam', name: 'Áo khoác', count: categoryCounts['ao-khoac-nam'] || 0 },
            { id: 'ao-polo-nam', name: 'Áo polo', count: categoryCounts['ao-polo-nam'] || 0 }
          ])
          
          setSizes(['S', 'M', 'L', 'XL', 'XXL'])
          
          setColors([
            { id: 1, name: 'Đen', hex: '#1a1a1a' },
            { id: 2, name: 'Trắng', hex: '#ffffff' },
            { id: 3, name: 'Xám', hex: '#6b7280' },
            { id: 4, name: 'Navy', hex: '#1e3a5f' },
            { id: 5, name: 'Xanh dương', hex: '#3b82f6' }
          ])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategories([
          { id: 'all', name: 'Tất cả', count: 0 },
          { id: 'ao-thun-nam', name: 'Áo thun', count: 0 },
          { id: 'ao-so-mi-nam', name: 'Sơ mi', count: 0 },
          { id: 'quan-jeans-nam', name: 'Quần', count: 0 },
          { id: 'ao-khoac-nam', name: 'Áo khoác', count: 0 },
          { id: 'ao-polo-nam', name: 'Áo polo', count: 0 }
        ])
        setSizes(['S', 'M', 'L', 'XL', 'XXL'])
        setColors([
          { id: 1, name: 'Đen', hex: '#1a1a1a' },
          { id: 2, name: 'Trắng', hex: '#ffffff' },
          { id: 3, name: 'Xám', hex: '#6b7280' },
          { id: 4, name: 'Navy', hex: '#1e3a5f' },
          { id: 5, name: 'Xanh dương', hex: '#3b82f6' }
        ])
      }
    }
    fetchCategories()
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = {
          gender: 'male',
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
          // Fallback demo products
          setProducts(getDemoProducts())
          setTotalPages(3)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts(getDemoProducts())
        setTotalPages(3)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [selectedCategory, selectedSizes, selectedColors, priceRange, sortBy, page])

  // Demo products fallback
  const getDemoProducts = () => [
    {
      id: 1,
      name: 'Áo khoác Wool Limited',
      slug: 'ao-khoac-wool-limited',
      price: 1250000,
      compare_price: 1560000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-qA5OYCNBl_SIYLB1Mm2lI2xhrCUXHDLF-mgQz88KsEZfljyUkXyVGfV0sMJ-Xgub6vWjflMqTQlM6cgRE0dcxW7TeSNYzi6765V0zW7gFmW8RwC4XwPTUXvp-OQk9sAOUMV1RVLOQMNyhKM2hPjXHGonAgoZVbvgFVeEHNZbY6PJ__FFy9AAVuAsDvWJeUcech4mF6NtSt805T13aQwFCWZZIXuURjZZsHmZKUuAOHIM0iw-WYZdOHcP5ZPJgzTO8Ptf_CvbwSg',
      avg_rating: 4,
      review_count: 128,
      is_on_sale: true
    },
    {
      id: 2,
      name: 'Sơ mi Linen Signature',
      slug: 'so-mi-linen-signature',
      price: 890000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQjMObzUC029kgy1S3bq2GLaPQ7JvXVld1LwrxbZDsBtocqGTxDJY-Vx5EOS2fLt9PoSBVeP03J8qZrDdCTtdZuMYKSSpslkPyP5OiISF1MHlQmYKeXZWvHOpkBUJRY7s12cyWallUFyr_3Ny2PvTea6c18yzicHIa1i9m_Vpej7YNyzT7ZKZN-sa_SEsxm7eOgJ09A28Uv49IMF12Ft9McjnrpWc53iusBHHCgvBQxpuTb6F7HnafK1Jxh--CK4FcOk1SKGC26GY',
      avg_rating: 5,
      review_count: 89
    },
    {
      id: 3,
      name: 'Quần Denim Nhật Bản',
      slug: 'quan-denim-nhat-ban',
      price: 1150000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwrlpjxfY4mkJD8fCzu3dbJrdFOqgzTEDTsbrYv3v7qRnoMZmSjr6enxAbL8s7u9ZnsBVcz0PlWbaA_miEex6LDBMQeCgzcl4v2s2_Qe5883J1tunpEUvnzeVutPu5gv3RBJQK09lxUmlQlW6TVV6-5kJPVyKC_X8csu9ZOEt8j_S9fACWL2Syo8HkAuK524mLt2ULu0Kjd3XmIxdqqz0o-JmBl3uzqJCKYUbbywFIjvGwXu44jdP4UOlR1jJlVyfHChm8kmXyh5U',
      avg_rating: 5,
      review_count: 156
    },
    {
      id: 4,
      name: 'Blazer Charcoal Slim-fit',
      slug: 'blazer-charcoal-slim-fit',
      price: 2450000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSnCEAZOgeNXIP6iKcqK8rERAY5B0Xe-WZ83A56V3EQfgf0AJhCiHUuxm1cSOnL_mI64XgyaDnIn94D-A1IKsTGsdMlVA3d8AgMGhUGk4O8P2tR9gwxr0Q3znS3ZOjlnQ15OxxhsvwtjCeonTdfRYCcTJjXr3t4N0FwKbkfqUbhZ2HRHs83ydZxZODjfOHfhzBEgANoyi53_q4Y7yG3CldgXOO3jzaP82H8glXnowhBfIfj6qo27l-kYoORLm_Sh6DCLZ5w6Gr8Sc',
      avg_rating: 4,
      review_count: 67
    },
    {
      id: 5,
      name: 'Premium Cotton Tee',
      slug: 'premium-cotton-tee',
      price: 450000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKpu0AtrmfY9Qp1jXawJnFm2MgNAe45gFUWyeAjzUgMkd7xR25rVhax2qp5tb2eKrgM7Tdk_zq0WNtC-b6yBo6mwiiQhPvlkcu6EII432AlvpDpCtsGz0fisgN0MnbP-tGJXaErkP4yvagSjmRXZD94KA1Z5bvddFia8InLutgYr0BSXqIZCJCgxTrWauhsotV5hDh3bxEiqOZ5qfoRBTIkD5a1hn3lwO15RwgNl7_Rq5pY11rbIOouCeSOhaYOATGC8_kjEMhE4c',
      avg_rating: 3,
      review_count: 234,
      is_new: true
    },
    {
      id: 6,
      name: 'Luxury Leather Sneakers',
      slug: 'luxury-leather-sneakers',
      price: 3200000,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTRuhuX_6ez3YpuxPXV03eW3A5B3DkTR_5hV0LdVxs6wP2mHtmzcHSkgcDx7xk_gHVZdvViPz6IlO93fCoNnsS-YinwR3NHjVXwj2gsnGQYEqmytg5t4ORJ67bIBPT5NovCb7ASGM6-W0dvg-OMx8Q0i8827Robaz19o7FkzWEvTLNtZlKqtgS1__VnUJqoxLIqY1d0VayZ37WP0LtqlWjRq7jIyMDdDEny5DVRqxWz1nlm81wqrKkEcKxVVunyISdJTS_VY_R7AY',
      avg_rating: 5,
      review_count: 89
    }
  ]

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

  const totalProducts = products.length > 0 ? products.length * totalPages : 84

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />
      
      <main className="pt-28 max-w-screen-2xl mx-auto px-12 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm mb-4 uppercase tracking-widest font-label">
            <Link className="hover:text-primary transition-colors" to="/">Trang chủ</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-on-surface font-medium">Nam</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tighter text-on-surface headline">Thời trang Nam</h1>
          <p className="text-base text-on-surface-variant mt-3 max-w-2xl">
            Khám phá bộ sưu tập thời trang nam cao cấp với chất liệu vải cao cấp, thiết kế hiện đại và phong cách thanh lịch. Phù hợp cho mọi dịp từ công sở đến dạo phố.
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
                <div className="relative group">
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
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
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                            Mới về
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

            {/* Load More Section */}
            <div className="mt-20 flex flex-col items-center gap-6">
              <div className="w-full h-px bg-surface-container"></div>
              <button className="bg-primary text-white px-12 py-5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-primary-container transition-all transform hover:-translate-y-1">
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

export default MenPage
