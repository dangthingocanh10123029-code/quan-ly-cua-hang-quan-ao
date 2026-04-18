import React from 'react'
import { Link } from 'react-router-dom'

const BlogSection = ({ news }) => {
  // Demo data khi không có news từ DB
  const sampleNews = [
    {
      id: 1,
      title: 'Xu hướng thời trang 2024: Những gì đang lên ngôi',
      slug: 'xu-huong-thoi-trang-2024',
      category: 'Xu hướng',
      thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      summary: 'Khám phá những xu hướng thời trang nổi bật nhất năm 2024.',
      published_at: '2024-04-15'
    },
    {
      id: 2,
      title: 'Cách phối đồ cho mùa hè năng động',
      slug: 'cach-phoi-do-cho-mua-he',
      category: 'Hướng dẫn',
      thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
      summary: 'Những tips phối đồ giúp bạn tự tin trong những ngày hè.',
      published_at: '2024-04-10'
    },
    {
      id: 3,
      title: 'Bền vững trong thời trang: Lựa chọn xanh cho tương lai',
      slug: 'ben-vung-trong-thoi-trang',
      category: 'Cộng đồng',
      thumbnail: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600',
      summary: 'CLOTH cam kết với môi trường bằng những bước tiến trong sản xuất bền vững.',
      published_at: '2024-04-05'
    }
  ]

  // Sử dụng news từ DB hoặc demo data
  const displayNews = news?.length > 0 ? news : sampleNews

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <section className="py-24 max-w-screen-2xl mx-auto px-8">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="headline-font text-4xl font-bold mb-2">Tin tức & Bài viết</h2>
          <p className="text-on-surface-variant">Cập nhật xu hướng và câu chuyện từ CLOTH</p>
        </div>
        <Link to="/blog" className="text-primary font-medium flex items-center gap-2 hover:underline">
          Xem tất cả
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {displayNews.slice(0, 3).map((article) => (
          <article key={article.id} className="group cursor-pointer">
            {/* Thumbnail */}
            <Link to={`/blog/${article.slug}`} className="block aspect-video overflow-hidden rounded-xl mb-6 bg-surface-container">
              <img
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                src={article.thumbnail || 'https://via.placeholder.com/600x340'}
                loading="lazy"
              />
            </Link>

            {/* Category */}
            <span className="text-[10px] font-bold uppercase text-primary tracking-widest block mb-2">
              {article.category || 'Tin tức'}
            </span>

            {/* Title */}
            <Link to={`/blog/${article.slug}`}>
              <h3 className="headline-font text-xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>

            {/* Summary */}
            <p className="text-on-surface-variant text-sm mb-4 leading-relaxed line-clamp-3">
              {article.summary || article.content?.substring(0, 150)}
            </p>

            {/* Date & Read More */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">
                {formatDate(article.published_at || article.created_at)}
              </span>
              <Link to={`/blog/${article.slug}`} className="text-sm font-bold text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                Xem thêm
                <span className="material-symbols-outlined text-sm">east</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BlogSection
