import React, { useState, useEffect } from 'react'

const Banner = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Fallback data nếu không có banners từ API
  const defaultBanners = [
    {
      id: 1,
      image: 'https://images.pexels.com/photos/13035127/pexels-photo-13035127.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'BỘ SƯU TẬP',
      subtitle: 'MÙA HÈ 2026',
      tag: 'Hàng Mới Về',
      description: 'Độ chính xác kỹ thuật kết hợp với thẩm mỹ cao cấp. Khám phá tương lai của trang phục kiến trúc.'
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/21063722/pexels-photo-21063722/free-photo-of-chan-dung-c-t-ng-i-dan-ong-tr-toc-vang.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'THỜI TRANG',
      subtitle: 'NAM 2026',
      tag: 'Xu Hướng',
      description: 'Phong cách hiện đại, thanh lịch dành cho phái mạnh. Tự tin khẳng định đẳng cấp.'
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/10131808/pexels-photo-10131808.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      title: 'BỘ SƯU TẬP',
      subtitle: 'NỮ 2026',
      tag: 'Hot Sale',
      description: 'Thời trang nữ cao cấp, kiểu dáng đa dạng. Nổi bật với phong cách riêng.'
    }
  ]

  const bannerList = banners?.length > 0 ? banners : defaultBanners
  const currentBanner = bannerList[currentIndex]

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerList.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [bannerList.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + bannerList.length) % bannerList.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerList.length)
  }

  return (
    <section className="relative w-full h-[870px] overflow-hidden bg-surface-container-low text-on-surface">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {bannerList.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              alt={banner.title}
              className="w-full h-full object-cover"
              src={banner.image}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/30 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-screen-2xl mx-auto">
        <span className="label-sm uppercase tracking-[0.2em] text-primary mb-4 font-bold">
          {currentBanner.tag || 'Hàng Mới Về'}
        </span>
        <h1 className="headline-font text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 max-w-3xl text-on-surface">
          {currentBanner.title}
          <br />
          {currentBanner.subtitle}
        </h1>
        <p className="text-base md:text-lg text-on-surface/80 mb-10 max-w-xl leading-relaxed">
          {currentBanner.description}
        </p>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-10 py-4 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 group shadow-lg">
            Mua Ngay
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
          <button className="bg-white text-on-surface px-10 py-4 rounded-lg font-medium hover:bg-white/90 transition-all border border-outline flex items-center gap-2 shadow-lg">
            Xem Chi Tiết
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
      >
        <span className="material-symbols-outlined text-on-surface">chevron_left</span>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
      >
        <span className="material-symbols-outlined text-on-surface">chevron_right</span>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {bannerList.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1 transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-12 bg-primary'
                : 'w-12 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </section>
  )
}

export default Banner