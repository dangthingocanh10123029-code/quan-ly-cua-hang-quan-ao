import React from 'react'
import { Link } from 'react-router-dom'

const BlogSection = ({ news }) => {
  const sampleNews = [
    {
      id: 1,
      title: 'Xu hướng thời trang 2026: Những gì đang lên ngôi',
      slug: 'xu-huong-thoi-trang-2026',
      category: 'Xu hướng',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      summary: 'Khám phá những xu hướng thời trang nổi bật nhất năm 2026.',
      published_at: '2026-04-15'
    },
    {
      id: 2,
      title: 'Cách phối đồ cho mùa hè năng động',
      slug: 'cach-phoi-do-cho-mua-he',
      category: 'Hướng dẫn',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
      summary: 'Những tips phối đồ giúp bạn tự tin trong những ngày hè.',
      published_at: '2026-04-10'
    },
    {
      id: 3,
      title: 'Bền vững trong thời trang: Lựa chọn xanh cho tương lai',
      slug: 'ben-vung-trong-thoi-trang',
      category: 'Cộng đồng',
      thumbnail: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80',
      summary: 'CLOTH cam kết với môi trường bằng những bước tiến trong sản xuất bền vững.',
      published_at: '2026-04-05'
    }
  ]

  const displayNews = news?.length > 0 ? news : sampleNews

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })
  }

  return (
    <section className="py-20 lg:py-28 max-w-[1400px] mx-auto px-6 md:px-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
        <div>
          <h2 className="font-display text-4xl md:text-5xl tracking-[-0.02em] text-slate-900 leading-tight">
            Tin tức & <span className="gradient-text">Bài viết</span>
          </h2>
        </div>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-[#4F46E5] font-semibold text-sm hover:gap-3 transition-all duration-200 group"
        >
          Xem tất cả
          <span className="material-symbols-outlined text-base group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayNews.slice(0, 3).map((article, index) => (
          <article
            key={article.id}
            className="group relative cursor-pointer"
          >
            {/* Gradient border wrapper for first card (featured) */}
            {index === 0 ? (
              <div className="rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] p-[2px]">
                <div className="rounded-[calc(1rem-2px)] bg-white h-full">
                  <BlogCard article={article} formatDate={formatDate} isFeatured />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-100 hover:border-[#4F46E5]/20 hover:shadow-[0_10px_25px_rgba(79,70,229,0.1)] transition-all duration-300 overflow-hidden">
                <BlogCard article={article} formatDate={formatDate} />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

const BlogCard = ({ article, formatDate, isFeatured = false }) => (
  <>
    {/* Thumbnail */}
    <Link to={`/blog/${article.slug}`} className="block overflow-hidden bg-slate-50">
      <div className="relative aspect-video overflow-hidden">
        <img
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          src={article.thumbnail}
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#4F46E5]/0 to-transparent group-hover:from-[#4F46E5]/10 transition-all duration-500" />

        {/* Category badge on image */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 bg-[#0F172A]/70 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-lg uppercase tracking-wider">
            {article.category || 'Tin tức'}
          </span>
        </div>
      </div>
    </Link>

    {/* Content */}
    <div className="p-6">
      {/* Date */}
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-[#4F46E5] text-sm">calendar_today</span>
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
          {formatDate(article.published_at || article.created_at)}
        </span>
      </div>

      {/* Title */}
      <Link to={`/blog/${article.slug}`}>
        <h3 className={`font-display font-bold text-slate-900 mb-3 group-hover:text-[#4F46E5] transition-colors duration-200 leading-snug ${isFeatured ? 'text-xl' : 'text-lg'} line-clamp-2`}>
          {article.title}
        </h3>
      </Link>

      {/* Summary */}
      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-5">
        {article.summary || article.content?.substring(0, 150)}
      </p>

      {/* Read more */}
      <Link
        to={`/blog/${article.slug}`}
        className="inline-flex items-center gap-2 text-[#4F46E5] font-semibold text-sm group/btn hover:gap-3 transition-all duration-200"
      >
        Đọc tiếp
        <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">east</span>
      </Link>
    </div>
  </>
)

export default BlogSection
