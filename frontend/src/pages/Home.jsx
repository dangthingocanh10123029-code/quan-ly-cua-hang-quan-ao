import React, { useState, useEffect } from 'react'
import { homeAPI } from '../services/api'

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

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await homeAPI.getHomeData()
      if (response && response.success) {
        setHomeData(response.data)
      } else {
        setHomeData({})
      }
    } catch (err) {
      console.error('Error fetching home data:', err)
      setHomeData({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Header cartCount={0} />
        <SkeletonLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <Header cartCount={0} />

      <main className="pt-0">
        {/* Hero Banner */}
        <Banner banners={homeData?.banners} />

        {/* Categories */}
        <div className="bg-[#F8FAFC]">
          <CategorySection categories={homeData?.categories} />
        </div>

        {/* Flash Sale */}
        <FlashSale flashSaleData={homeData?.flashSales} saleProductsData={homeData?.saleProducts} />

        {/* New Products */}
        <div className="bg-white">
          <ProductSection
            products={homeData?.featuredProducts}
            title="Sản phẩm mới"
            subtitle="Những thiết kế kỹ thuật được cập nhật liên tục từ studio của chúng tôi."
          />
        </div>

        {/* Best Sellers */}
        <div className="bg-[#F8FAFC]">
          <BestSellerSection products={homeData?.bestSellers} />
        </div>

        {/* Brands */}
        <BrandSection brands={homeData?.brands} />

        {/* Blog/News */}
        <div className="bg-white">
          <BlogSection news={homeData?.news} />
        </div>

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  )
}

export default Home
