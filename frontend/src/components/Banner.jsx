import React, { useState, useEffect } from 'react'

const Banner = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const defaultBanners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
      tag: 'Bộ Sưu Tập Mới',
      title: 'Khám Phá',
      titleAccent: 'Phong Cách',
      subtitle: 'Mùa Hè 2026',
      description: 'Độ chính xác kỹ thuật kết hợp với thẩm mỹ cao cấp. Tạo nên diện mạo hoàn hảo cho mọi khoảnh khắc.',
      cta: '/nam',
      ctaSecondary: '/giam-gia',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&q=80',
      tag: 'Xu Hướng 2026',
      title: 'Thời Trang',
      titleAccent: 'Đương Đại',
      subtitle: 'Nam & Nữ',
      description: 'Phong cách hiện đại, thanh lịch dành cho những người dám khác biệt. Tự tin khẳng định đẳng cấp.',
      cta: '/nu',
      ctaSecondary: '/tre-em',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80',
      tag: 'Hot Collection',
      title: 'Bộ Sưu Tập',
      titleAccent: 'Đặc Biệt',
      subtitle: 'Giảm Đến 50%',
      description: 'Những thiết kế mang tính biểu tượng, được chế tác từ chất liệu cao cấp nhất. Ưu đãi chỉ trong thời gian giới hạn.',
      cta: '/giam-gia',
      ctaSecondary: '/nam',
    },
  ]

  const bannerList = banners?.length > 0 ? banners : defaultBanners
  const current = bannerList[currentIndex]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % bannerList.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [bannerList.length])

  return (
    <section className="relative w-full h-[90vh] min-h-[620px] mt-[80px] overflow-hidden bg-[#0F172A]">

      {/* Atmospheric Blur Orbs - the signature depth effect */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#4F46E5]/20 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '6000ms' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#7C3AED]/15 blur-[80px] pointer-events-none animate-pulse" style={{ animationDuration: '8000ms' }} />

      {/* Gradient separator at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 h-1 bg-gradient-to-r from-transparent via-[#4F46E5]/30 to-transparent pointer-events-none" />

      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {bannerList.map((banner, index) => (
          <div
            key={banner.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img alt={banner.title} className="w-full h-full object-cover object-center" src={banner.image} />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/95 via-[#0F172A]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-[#0F172A]/30" />
          </div>
        ))}
      </div>

      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 z-[1] dot-pattern pointer-events-none" />

      {/* Animated Ring Decoration - Right Side */}
      <div className="absolute right-[6%] top-1/2 -translate-y-1/2 z-[2] hidden lg:block">
        <div className="relative w-[400px] h-[400px]">
          {/* Outer dashed rotating ring */}
          <div
            className="absolute inset-0 rounded-full animate-rotate"
            style={{
              border: '1px dashed rgba(79, 70, 229, 0.2)',
            }}
          />
          {/* Inner solid ring */}
          <div
            className="absolute inset-10 rounded-full"
            style={{ border: '1px solid rgba(124, 58, 237, 0.1)' }}
          />
          {/* Core glow */}
          <div
            className="absolute inset-20 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)" }}
          />

          {/* Floating card 1 - Top */}
          <div className="absolute top-6 right-6 animate-float">
            <div className="bg-white/[0.08] backdrop-blur-xl rounded-2xl p-4 border border-white/[0.1] shadow-[0_8px_32px_rgba(79,70,229,0.15)]">
              <img
                alt="product"
                src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=80"
                className="w-24 h-24 rounded-xl object-cover"
              />
              <p className="text-white text-[11px] font-semibold mt-2">Heavyweight Tee</p>
              <p className="text-[#7C3AED] text-sm font-bold mt-0.5">390.000đ</p>
            </div>
          </div>

          {/* Floating card 2 - Bottom */}
          <div className="absolute bottom-10 left-6 animate-float-delayed">
            <div className="bg-white/[0.08] backdrop-blur-xl rounded-2xl p-3 border border-white/[0.1] shadow-[0_8px_32px_rgba(79,70,229,0.1)]">
              <img
                alt="product"
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <p className="text-white text-[10px] font-semibold mt-2">Cloud Runner X</p>
              <p className="text-[#7C3AED] text-xs font-bold mt-0.5">790.000đ</p>
            </div>
          </div>

          {/* Accent core dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full bg-[#4F46E5] shadow-[0_0_24px_#4F46E5]" />
          </div>

          {/* Small decorative floating badge */}
          <div className="absolute top-1/2 -left-8 -translate-y-1/2 animate-float" style={{ animationDelay: '2s' }}>
            <div className="bg-[#4F46E5]/20 backdrop-blur-md rounded-full px-4 py-2 border border-[#4F46E5]/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
              <span className="text-white text-[10px] font-semibold tracking-wider">NEW 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto">
        <div className="max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Headline - Corporate Trust: tight tracking, bold */}
          <div className="mb-8">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-0.02em] mb-1 text-white">
              {current.title}
            </h1>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.9] tracking-[-0.02em]">
              <span className="gradient-text">{current.titleAccent}</span>
            </h1>
            {/* Gradient underline bar */}
            <div className="h-1 w-32 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full mt-5 shadow-[0_0_20px_rgba(79,70,229,0.4)]" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-white/30 leading-tight mb-8">
            {current.subtitle}
          </h2>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <a
              href={current.cta || '/'}
              className="btn-primary px-8 py-4 rounded-xl font-semibold text-sm flex items-center gap-2"
            >
              Mua Ngay
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </a>
            <a
              href={current.ctaSecondary || '/'}
              className="px-8 py-4 rounded-xl font-semibold text-sm text-white border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200 flex items-center gap-2"
            >
              Xem Thêm
              <span className="material-symbols-outlined text-base">visibility</span>
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center gap-3 mt-16">
            <div className="w-8 h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-3 rounded-full bg-white/40 animate-bounce" />
            </div>
            <span className="text-white/30 text-xs font-medium uppercase tracking-[0.2em]">Cuộn xuống</span>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentIndex(prev => (prev - 1 + bannerList.length) % bannerList.length)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/[0.08] backdrop-blur-sm text-white border border-white/[0.1]
          hover:bg-[#4F46E5]/80 hover:border-[#4F46E5]/50 hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-200 flex items-center justify-center group"
      >
        <span className="material-symbols-outlined group-hover:-translate-x-0.5 transition-transform">chevron_left</span>
      </button>
      <button
        onClick={() => setCurrentIndex(prev => (prev + 1) % bannerList.length)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-xl bg-white/[0.08] backdrop-blur-sm text-white border border-white/[0.1]
          hover:bg-[#4F46E5]/80 hover:border-[#4F46E5]/50 hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] transition-all duration-200 flex items-center justify-center group"
      >
        <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">chevron_right</span>
      </button>

      {/* Dots + Progress Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-5">
        <div className="flex gap-2.5">
          {bannerList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === currentIndex
                  ? 'w-12 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                  : 'w-3 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        {/* Slide counter */}
        <span className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-medium">
          {String(currentIndex + 1).padStart(2, '0')} / {String(bannerList.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}

export default Banner
