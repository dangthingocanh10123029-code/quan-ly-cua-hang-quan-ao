import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { homeAPI } from '../services/api'

// Components
import Header from '../components/Header'
import Banner from '../components/Banner'
import CategorySection from '../components/CategorySection'
import FlashSale from '../components/FlashSale'
import ProductSection from '../components/ProductSection'
import BestSellerSection from '../components/BestSellerSection'
import BrandSection from '../components/BrandSection'
import BlogSection from '../components/BlogSection'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import SkeletonLoader from '../components/SkeletonLoader'

const Home = () => {
  const [homeData, setHomeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartCount] = useState(3) // Demo cart count

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Gọi API lấy dữ liệu trang chủ
      const response = await homeAPI.getHomeData()
      
      if (response.success) {
        setHomeData(response.data)
      } else {
        setError(response.message)
      }
    } catch (err) {
      console.error('Error fetching home data:', err)
      setError('Không thể tải dữ liệu. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header cartCount={0} />
        <SkeletonLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-error text-lg mb-4">{error}</p>
          <button
            onClick={fetchHomeData}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <Header cartCount={cartCount} />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Banner */}
        <Banner banners={homeData?.banners} />

        {/* Categories Grid */}
        <CategorySection categories={homeData?.categories} />

        {/* Flash Sale */}
        <FlashSale flashSaleData={homeData?.flashSales} />

        {/* New Products */}
        <ProductSection
          products={homeData?.featuredProducts}
          title="Sản phẩm mới"
        />

        {/* Best Sellers */}
        <BestSellerSection products={homeData?.bestSellers} />

        {/* Brands */}
        <BrandSection brands={homeData?.brands} />

        {/* Blog/News */}
        <BlogSection news={homeData?.news} />

        {/* Newsletter */}
        <Newsletter />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home