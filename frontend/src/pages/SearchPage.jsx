import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Footer from '../components/Footer'
import { searchAPI } from '../services/api'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        const response = await searchAPI.search(query)
        setProducts(response.data || [])
      } catch (err) {
        console.error('Search error:', err)
        setError('Đã xảy ra lỗi khi tìm kiếm')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [query])

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      <main className="pt-20">
        <div className="max-w-screen-2xl mx-auto px-8 py-12">
          <h1 className="headline-font text-3xl font-bold mb-2">
            Kết quả tìm kiếm
          </h1>
          <p className="text-on-surface-variant mb-8">
            {query ? `"${query}" - ${products.length} sản phẩm được tìm thấy` : 'Nhập từ khóa để tìm kiếm'}
          </p>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-error">{error}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
              <h2 className="text-xl font-medium mb-2">Không tìm thấy sản phẩm nào</h2>
              <p className="text-on-surface-variant">Hãy thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SearchPage